import { PurchasePackData, PurchasePackIdsEnum, PurchasePackTypesEnum } from '@/purchase/types/PurchasePack';
import { PaymentMethod } from '@/purchase/types';

export const GENERATIONS_PURCHASE_ARTWORK_PRICE_USD = 300;
export const GENERATIONS_PURCHASE_SET_PRICE_USD = 1800;

// amount of artworks on set for price calculation
export const GENERATIONS_PURCHASE_ARTWORKS_IN_SET_AMOUNT = 5;

export const GENERATIONS_PURCHASE_CUSTOM_LIMITS = {
  min: 1,
  max: 10,
};

export const GENERATIONS_PURCHASE_SINGLE_PACK = {
  id: PurchasePackIdsEnum.single,
  type: PurchasePackTypesEnum.pack,
  label: 'Single',
  amount: 1,
  payment: [PaymentMethod.ETH, PaymentMethod.USD],
};

export const GENERATIONS_PURCHASE_CUSTOM_PACK = {
  id: PurchasePackIdsEnum.custom,
  type: PurchasePackTypesEnum.pack,
  label: 'Custom',
  amount: 0,
  payment: [PaymentMethod.ETH, PaymentMethod.USD],
};

/*
 * Config for the Purchase window of generations
 * Can change the order = it will be changes on the UI
 * label = shows on the UI
 * amount = amount of the artworks on the pack if this is a pack
 * payment = available payment methods
 */
export const GENERATIONS_PURCHASE_PACKS: PurchasePackData[] = [
  /*
    GENERATIONS_PURCHASE_SINGLE_PACK,
  {
    id: PurchasePackIdsEnum.pack2,
    type: PurchasePackTypesEnum.pack,
    label: '2 Pack',
    amount: 2,
    payment: [PaymentMethodsEnum.ETH, PaymentMethodsEnum.USD],
  },
  {
    id: PurchasePackIdsEnum.pack3,
    type: PurchasePackTypesEnum.pack,
    label: '3 Pack',
    amount: 3,
    payment: [PaymentMethodsEnum.ETH, PaymentMethodsEnum.USD],
  },
  GENERATIONS_PURCHASE_CUSTOM_PACK,

   */
  {
    id: PurchasePackIdsEnum.set,
    type: PurchasePackTypesEnum.set,
    label: 'Special Set',
    amount: 1,
    payment: [PaymentMethod.USD],
  },
];
