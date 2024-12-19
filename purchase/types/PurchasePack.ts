import { PaymentMethod } from '@/purchase/types/PaymentMethods';

export enum PurchasePackTypesEnum {
  pack = 'pack', // single is a pack, but the pack of one
  set = 'set',
}

export enum PurchasePackIdsEnum {
  single = 'single',
  pack2 = '2-pack',
  pack3 = '3-pack',
  custom = 'custom',
  set = 'set',
}

export type PurchasePackData = {
  id: PurchasePackIdsEnum;
  type: PurchasePackTypesEnum;
  label: string;
  amount: number;
  payment: PaymentMethod[];
};
