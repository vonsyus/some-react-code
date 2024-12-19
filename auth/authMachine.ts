import { createMachine, assign } from 'xstate';
import { AuthClient } from './AuthClient';

const authClient = new AuthClient();

export const authMachine = createMachine<AuthContext, AuthEvents, AuthTypestate>({
  id: 'auth',
  initial: 'auth-checking',
  states: {
    'auth-checking': {
      invoke: {
        id: 'auth-check',
        src: async () => {
          try {
            await authClient.check();
            const authToken = await authClient.getAuthToken();
            return authToken;
          } catch (e) {
            throw e;
          }
        },
        onDone: {
          target: 'authenticated',
          actions: assign({ authToken: (context, event) => event.data })
        },
        onError: {
          target: 'no-auth'
        }
      }
    },
    'no-auth': {
      invoke: {
        id: 'log-out',
        src: async (_, event) => {
          if (event.type !== 'LOG_OUT_INITIATED') return;
          await authClient.signOut();
        }
      },
      on: {
        WALLET_CONNECT_INITIATED: {
          target: 'wallet-connecting',
          actions: assign({ connectMethod: (_, event) => event.connector })
        },
      },
    },
    'authenticated': {
      on: {
        LOG_OUT_INITIATED: {
          target: 'no-auth',
        },
      },
    },
    'signing-in': {
      invoke: {
        id: 'sign-in',
        src: async ({ address, signature }) => {
          if (!address) {
            throw new Error('Address is not present.');
          }
          if (!signature) {
            throw new Error('Signature is not present.');
          }
          try {
            await authClient.signIn(address, signature);
            return await authClient.getAuthToken();
          } catch (e) {
            throw e;
          }
        },
        onDone: {
          target: 'authenticated',
          actions: assign({ authToken: (_, event) => event.data })
        },
        onError: {
          target: 'no-auth'
        }
      }
    },
    'wallet-connecting': {
      on: {
        WALLET_CONNECTED: {
          target: 'signing-in',
          actions: assign({ address: (_, event) => event.address, signature: (_, event) => event.signature })
        },
        WALLET_FAILED: {
          target: 'no-auth'
        }
      },
    },
  },
  context: {
    authToken: undefined,
    connectMethod: undefined,
    signature: undefined,
    address: undefined
  },
  predictableActionArguments: true,
  preserveActionOrder: true,
});

export enum Connector {
  MetaMask = 'MetaMask',
  WalletConnect = 'WalletConnect',
  Fortmatic = 'Fortmatic'
}

export interface AuthContext {
  authToken?: string;
  connectMethod?: Connector;
  signature?: string;
  address?: string;
}

export type AuthTypestate =
  | { value: 'auth-checking'; context: AuthContext; }
  | { value: 'authenticated'; context: AuthContext & { authToken: string; }; }
  | { value: 'no-auth'; context: AuthContext; }
  | { value: 'wallet-connecting'; context: AuthContext & { connectMethod: Connector; }; }
  | { value: 'signing-in'; context: AuthContext & { address: string; signature: string; }; }

export type AuthEvents =
  | { type: 'WALLET_CONNECT_INITIATED'; connector: Connector; }
  | { type: 'WALLET_CONNECTED'; address: string; signature: string; }
  | { type: 'WALLET_FAILED'; }
  | { type: 'CONNECT_SUCCEEDED'; }
  | { type: 'CONNECT_FAILED'; }
  | { type: 'LOG_OUT_INITIATED'; };
