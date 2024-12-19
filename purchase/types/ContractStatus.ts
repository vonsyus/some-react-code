export enum ContractStatusEnum {
  presale = 'presale',
  public = 'public',
  notStarted = 'not-started',
}

export enum FeelGoodSpinsContractStatusEnum {
  NOT_ACTIVE,
  PRIVATE_STAGE_1,
  PRIVATE_STAGE_2,
  PUBLIC
}

export type ContractStatusData = {
  status: ContractStatusEnum;
  soldOut: boolean;
  loaded: boolean;
};
