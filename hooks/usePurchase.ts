import { PurchaseContext, PurchaseEvents, PurchaseTypestate } from '../purchase/purchaseMachine';
import { Interpreter } from 'xstate';
import { useContext } from 'react';
import { StateContext } from '../context/StateContext';
import { useActor } from '@xstate/react';

type UsePurchase = () => UsePurchaseReturnValue;

interface UsePurchaseReturnValue {
  purchaseService?: Interpreter<PurchaseContext, any, PurchaseEvents, PurchaseTypestate, any>;
  context: PurchaseContext;
  isIdle: boolean;
  isCryptoProcessing: boolean;
  isPurchaseSucceeded: boolean;
  isFiatProcessing: boolean;
  isCryptoModalVisible: boolean;
  isFiatModalVisible: boolean;
  areOptionsVisible: boolean;
  isRandomizing: boolean;
  isResult: boolean;
}

export const usePurchase: UsePurchase = () => {
  const { purchaseService } = useContext(StateContext);
  const [state] = useActor(purchaseService!);
  const isFiat = state.value === 'fiat' || state.value === 'fiat-processing';
  const isCrypto = state.value === 'crypto' || state.value === 'crypto-processing';

  return {
    purchaseService,
    isCryptoModalVisible: isCrypto,
    isFiatModalVisible: isFiat,
    isPurchaseSucceeded: state.value === 'succeeded',
    isCryptoProcessing: state.value === 'crypto-processing',
    isFiatProcessing: state.value === 'fiat-processing',
    isRandomizing: state.value === 'randomization',
    areOptionsVisible: state.value === 'select' || isFiat || isCrypto || state.value === 'fiat-initiating',
    isResult: state.value === 'result',
    isIdle: state.value === 'idle',
    context: state.context
  };
};
