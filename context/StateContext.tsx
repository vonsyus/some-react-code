import { createContext, FC, PropsWithChildren, useMemo } from 'react';
import { Interpreter } from 'xstate';
import { useInterpret } from '@xstate/react';
import { AuthEvents, authMachine, AuthContext, AuthTypestate } from '../auth/authMachine';
import { ProfileEvents, profileMachine, ProfileContext, ProfileTypestate } from '../profile/profileMachine';
import { PurchaseContext, PurchaseEvents, purchaseMachine, PurchaseTypestate } from '../purchase/purchaseMachine';

interface TStateContext {
  authService?: Interpreter<AuthContext, any, AuthEvents, AuthTypestate, any>;
  profileService?: Interpreter<ProfileContext, any, ProfileEvents, ProfileTypestate, any>;
  purchaseService?: Interpreter<PurchaseContext, any, PurchaseEvents, PurchaseTypestate, any>;
}

export const StateContext = createContext<TStateContext>({
  authService: undefined,
  profileService: undefined,
  purchaseService: undefined
});

export const StateProvider: FC<PropsWithChildren> = ({ children }) => {
  const authService = useInterpret(authMachine);
  const profileService = useInterpret(profileMachine);
  const purchaseService = useInterpret(purchaseMachine);
  const contextValue = useMemo<TStateContext>(
    () => ({ authService, profileService, purchaseService }),
    [authService, profileService, purchaseService]
  );
  return (
    <StateContext.Provider value={contextValue}>
      {children}
    </StateContext.Provider>
  );
};
