import { assign, createMachine } from 'xstate';
import { AuthClient } from '@/auth/AuthClient';
import { PurchaseClient } from './PurchaseClient';
import { ReactNode } from 'react';
import { Signer } from 'ethers';
import { ContractTypes } from '@/purchase/ContractClient';
import { ProfileClient } from '@/profile/ProfileClient';
import { ProfileArtworksMapper } from '@/profile/ProfileArtworksMapper';
import { PollUntil } from 'poll-until-promise';
import { SlotsClient } from "@/slots/SlotsClient";

const authClient = new AuthClient();
const purchaseClient = new PurchaseClient(authClient);
const profileClient = new ProfileClient(authClient);
const slotsClient = new SlotsClient(authClient);
const pollUntilPromise = new PollUntil();
const isSlotsPresale = process.env.NEXT_PUBLIC_FEEL_GOOD_SPINS_PRESALE ? process.env.NEXT_PUBLIC_FEEL_GOOD_SPINS_PRESALE === 'true' : false;

const emptyContext: PurchaseContext = {
  quantity: undefined,
  label: undefined,
  imgSrc: undefined,
  priceETH: undefined,
  priceUSD: undefined,
  secret: undefined,
  errorMessage: undefined,
  successMessage: undefined,
  contractType: undefined,
  isSet: false,
  oldPills: undefined,
  purchasedPills: undefined,
  spinsCount: undefined
};

const getItemToSellName = (contractType?: ContractTypes) => {
  switch (contractType) {
    case ContractTypes.Siebren:
      return 'claims';
    case ContractTypes.Nascent:
      return 'pills';
    case ContractTypes.Generations:
      return 'generations';
    case ContractTypes.FeelGoodSpins:
      return 'coins';
    default:
      return 'items';
  }
}

export const purchaseMachine = createMachine<PurchaseContext, PurchaseEvents, PurchaseTypestate>({
  id: 'purchase',
  initial: 'idle',
  states: {
    idle: {
      on: {
        OPTIONS_VIEW_REQUESTED: {
          target: 'select'
        }
      }
    },
    select: {
      on: {
        SELECT_ABANDONED: {
          target: 'idle'
        },
        CRYPTO_TRIGGERED: {
          target: 'crypto',
          actions: assign({
            quantity: (_, { quantity }) => quantity,
            label: (_, { label }) => label,
            imgSrc: (_, { imgSrc }) => imgSrc,
            priceETH: (_, { priceETH }) => priceETH,
            contractType: (_, { contractType }) => contractType,
            isSet: (_, { isSet }) => isSet,
          }),
        },
        FIAT_TRIGGERED: {
          target: 'fiat-initiating',
          actions: assign({
            quantity: (_, { quantity }) => quantity,
            label: (_, { label }) => label,
            contractType: (_, { contractType }) => contractType,
            isSet: (_, { isSet }) => isSet,
            imgSrc: (_, { imgSrc }) => imgSrc,
          }),
        },
      },
    },
    // crypto flow
    crypto: {
      invoke: {
        id: 'getting-old-pills',
        src: async () => {
          try {
            const artworks = await profileClient.getArsnlArtworks();
            const pills = ProfileArtworksMapper.mapNascentArtworks(artworks.artworksPills);
            const oldPills = pills.map((pill) => pill.name);
            return { oldPills };
          } catch (e) {
            console.error(e);
            throw e;
          }
        },
        onDone: {
          actions: assign({
            oldPills: (_, { data }) => data.oldPills
          })
        }
      },
      // @ts-ignore
      on: {
        CRYPTO_CONFIRMED: {
          target: 'crypto-processing',
        },
        CRYPTO_ABANDONED: {
          target: 'select',
          actions: assign(emptyContext),
        },
      },
    },
    'crypto-processing': {
      // @ts-ignore
      invoke: {
        id: 'purchase-by-crypto',
        src: async (context, event) => {
          if (event.type !== 'CRYPTO_CONFIRMED' || !context.contractType) return;
          try {
            const artworks = await profileClient.getArsnlArtworks();
            const pills = ProfileArtworksMapper.mapNascentArtworks(artworks.artworksPills);
            const oldPills = pills.map((pill) => pill.name);
            await purchaseClient.purchaseByCrypto(
              context.quantity!,
              context.priceETH!,
              event.signer,
              context.contractType,
              context.isSet || false
            );
            const spinsAfterPurchase = await slotsClient.getSpinsAvailable(isSlotsPresale);
            return { oldPills, spinsCount: spinsAfterPurchase.spinsAvailable };
          } catch (e) {
            console.error(e);
            throw e;
          }
        },
        onDone: {
          target: 'succeeded',
          actions: assign({
            oldPills: (_, { data }) => data.oldPills,
            spinsCount: (_, { data }) => data.spinsCount
          })
        },
        onError: {
          target: 'failed',
          actions: assign({
            errorMessage: (context) => {
              if (context.isSet) {
                return `Purchase of a set of ${getItemToSellName(context.contractType)} has failed.`;
              }
              if (context.quantity === 1) {
                return `Purchase of 1 ${getItemToSellName(context.contractType)} has failed.`;
              }
              return `Purchase of a set of ${context.quantity} ${getItemToSellName(context.contractType)} has failed.`;
            },
          }),
        },
      },
    },
    // FIAT flow
    'fiat-initiating': {
      invoke: {
        id: 'get-secret',
        src: async (context, event) => {
          if (event.type !== 'FIAT_TRIGGERED' || !context.contractType) return;

          const { secret, amount_usd } = await purchaseClient.attemptStripePurchase(
            event.quantity,
            context.contractType,
            context.isSet,
          );
          return {
            secret,
            priceUSD: amount_usd,
            label: event.label,
            imgSrc: event.imgSrc,
          };
        },
        onDone: {
          target: 'fiat',
          actions: assign({
            secret: (_, { data }) => data.secret,
            priceUSD: (_, { data }) => data.priceUSD,
            label: (_, { data }) => data.label,
            imgSrc: (_, { data }) => data.imgSrc,
          }),
        },
        onError: {
          target: 'failed',
          actions: assign({
            errorMessage: (context, error) => {
              if (error?.data?.toString().includes('no sets available')) {
                return `Purchase of more ${getItemToSellName(context.contractType)} cannot be done by this wallet.`;
              }
              return `Purchase of ${context.quantity} ${getItemToSellName(context.contractType)} cannot be done by this user.`;
            },
          }),
        },
      },
    },
    fiat: {
      invoke: {
        id: 'getting-old-pills',
        src: async () => {
          try {
            const artworks = await profileClient.getArsnlArtworks();
            const pills = ProfileArtworksMapper.mapNascentArtworks(artworks.artworksPills);
            const oldPills = pills.map((pill) => pill.name);
            return { oldPills };
          } catch (e) {
            console.error(e);
            throw e;
          }
        },
        onDone: {
          actions: assign({
            oldPills: (_, { data }) => data.oldPills
          })
        }
      },
      // @ts-ignore
      on: {
        FIAT_CONFIRMED: {
          target: 'fiat-processing',
        },
        FIAT_ABANDONED: {
          target: 'select',
          actions: assign(emptyContext),
        },
      },
    },
    'fiat-processing': {
      // @ts-ignore
      on: {
        FIAT_PROCESSING_SUCCESS: {
          target: 'succeeded',
          actions: assign({
            successMessage: (context) => {
              const { quantity, isSet } = context;
              if (isSet) return 'You bought 1 set';
              if (quantity == 1) return `You bought 1 ${getItemToSellName(context.contractType)}`;
              return `You bought ${quantity} ${getItemToSellName(context.contractType)}`;
            },
          }),
        },
        FIAT_PROCESSING_FAILURE: {
          target: 'failed',
          actions: assign({
            errorMessage: 'An error occured. Please try again.',
          }),
        },
      },
    },
    'randomization': {
      // @ts-ignore
      invoke: {
        id: 'getting-results',
        src: async (context) => {
          const purchasedPills = await pollUntilPromise
            .stopAfter(60 * 1000)
            .tryEvery(5 * 1000)
            .execute(async () =>
              new Promise(async (resolve, reject) => {
                const artworks = await profileClient.getArsnlArtworks();
                const pills = ProfileArtworksMapper.mapNascentArtworks(artworks.artworksPills);
                const newPills = pills.map((pill) => pill.name);
                const purchasedPills = compareSets(context.oldPills ?? [], newPills)
                if (purchasedPills.length > 0) {
                  resolve(purchasedPills);
                } else {
                  reject();
                }
              })
            );
          return { purchasedPills };
        },
        onDone: {
          target: 'result',
          actions: assign({
            purchasedPills: (_, { data }) => data.purchasedPills
          })
        }
      },
    },
    'succeeded': {
      // @ts-ignore
      invoke: {
        id: 'success-purchase',
        src: async (context) => {
          const purchasedSpins = await slotsClient.getSpinsAvailable(isSlotsPresale);
          return { spinsCount: purchasedSpins.spinsAvailable };
        },
        onDone: {
          actions: assign({
            successMessage: (context) => {
              const { quantity, isSet } = context;
              if (isSet) return 'You bought 1 set';
              if (quantity == 1) return `You bought 1 ${getItemToSellName(context.contractType)}`;
              return `You bought ${quantity} ${getItemToSellName(context.contractType)}`;
            },
            spinsCount: (_, { data }) => data.spinsCount
          })
        }
      }
    },
    'result': {
      on: {
        RESULT_ABANDONED: {
          target: 'idle'
        }
      }
    },
    'failed': {
      // @ts-ignore
      after: {
        20000: {
          target: 'idle',
          actions: assign(emptyContext),
        },
      },
    },
  },
  context: emptyContext,
  predictableActionArguments: true,
  preserveActionOrder: true,
});

export interface PurchaseContext {
  label?: ReactNode;
  imgSrc?: string;
  priceUSD?: number;
  priceETH?: string;
  quantity?: number;
  successMessage?: string;
  errorMessage?: string;
  secret?: string;
  contractType?: ContractTypes;
  isSet?: boolean;
  oldPills?: string[];
  purchasedPills?: string[];
  spinsCount?: number;
}

export type PurchaseTypestate =
  | { value: 'idle'; context: PurchaseContext }
  | { value: 'select'; context: PurchaseContext }
  | {
      value: 'crypto';
      context: PurchaseContext & { label: ReactNode; imgSrc: string; priceETH: string; quantity: number };
    }
  | {
      value: 'crypto-processing';
      context: PurchaseContext & {
        label: ReactNode;
        imgSrc: string;
        priceETH: string;
        contractType: ContractTypes;
      };
    }
  | { value: 'fiat-initiating'; context: PurchaseContext }
  | { value: 'fiat'; context: PurchaseContext & { label: ReactNode; imgSrc: string; priceUSD: number; secret: string } }
  | {
      value: 'fiat-processing';
      context: PurchaseContext & { label: ReactNode; imgSrc: string; priceUSD: number; secret: string };
    }
  | { value: 'randomization'; context: PurchaseContext & { oldPills: string[] }}
  | { value: 'result'; context: PurchaseContext & { purchasedPills: string[] }}
  | { value: 'succeeded'; context: PurchaseContext & { successMessage: string } }
  | { value: 'failed'; context: PurchaseContext & { errorMessage: string } };

export type PurchaseEvents =
  | {
      type: 'CRYPTO_TRIGGERED';
      quantity: number;
      priceETH: string;
      label: ReactNode;
      imgSrc: string;
      contractType: ContractTypes;
      isSet?: boolean;
    }
  | { type: 'CRYPTO_ABANDONED' }
  | { type: 'SELECT_ABANDONED' }
  | { type: 'OPTIONS_VIEW_REQUESTED' }
  | { type: 'CRYPTO_FINAL_STATUS_ABANDONED' }
  | {
      type: 'FIAT_TRIGGERED';
      quantity: number;
      label: ReactNode;
      imgSrc: string;
      contractType: ContractTypes;
      isSet?: boolean;
    }
  | { type: 'FIAT_ABANDONED' }
  | { type: 'CRYPTO_CONFIRMED'; signer: Signer }
  | { type: 'FIAT_CONFIRMED' }
  | { type: 'FIAT_PROCESSING_FAILURE' }
  | { type: 'RESULT_ABANDONED' }
  | { type: 'FIAT_PROCESSING_SUCCESS' };


function compareSets(arr1: string[], arr2: string[]): string[] {
  const map1 = genMapFromArray(arr1);
  const map2 = genMapFromArray(arr2);
  const diffArr: string[] = [];
  for (const [key, value] of map2) {
    const prevValue = map1.get(key) ?? 0;
    const length = value - prevValue;
    const subArr = Array.from({ length }, () => key);
    subArr.forEach((str) => {
      diffArr.push(str);
    });
  }
  return diffArr;
}

function genMapFromArray(arr: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const str of arr) {
    if (map.has(str)) {
      map.set(str, map.get(str)! + 1);
    } else {
      map.set(str, 1);
    }
  }
  return map;
}
