import { CSSProperties, FC } from 'react';
import ReactModal from 'react-modal';
import * as React from 'react';
import styles from './GenerationsClaimsModal.module.scss';
import { useGenerationsContract, useStripeData, usePurchase } from '@/hooks';
import { StripePaymentStatus } from '@/components/StripePaymentStatus/StripePaymentStatus';
import { Elements } from '@stripe/react-stripe-js';
import { ContractTypes } from '@/purchase/ContractClient';
import { GenerationsClaimsModalContent } from '@/components/templates/generations/GenerationsFixedBuyNowButton/GenerationsClaimsModalContent';
import { GENERATIONS_PURCHASE_ARTWORKS_IN_SET_AMOUNT } from '@/purchase/configs/generations';

type Props = ReactModal.Props & {
  onRequestClose: () => void;
};

const overlay: CSSProperties = {
  zIndex: 100,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backdropFilter: 'blur(5px)',
};

const renderPurchaseItemLabel = (quantity: number, isSet?: boolean) => {
  const packString = isSet
    ? `Curated set of ${GENERATIONS_PURCHASE_ARTWORKS_IN_SET_AMOUNT}`
    : `${quantity} artwork${quantity > 1 ? 's' : ''}`;
  return (
    <>
      <div>ANNA LUCIA x GEE’S BEND QUILTERS,</div>
      <div>Generations.</div>
      <div>{packString}</div>
    </>
  );
};

export const GenerationsClaimsModal: FC<Props> = ({ isOpen, onRequestClose }) => {
  const { soldOut } = useGenerationsContract();
  const { stripePromise } = useStripeData();
  const { purchaseService } = usePurchase();

  const onFiatPurchase = (quantity: number, isSet: boolean) => {
    if (!quantity || !purchaseService || soldOut) return;
    purchaseService.send({
      type: 'FIAT_TRIGGERED',
      quantity,
      label: renderPurchaseItemLabel(quantity, isSet),
      imgSrc: '/media/purchase-screen/purchase-canvas.jpg',
      contractType: ContractTypes.Generations,
      isSet,
    });
  };

  const onCryptoPurchase = (quantity: number, price: number) => {
    if (!quantity || !purchaseService || !price || soldOut) return;
    purchaseService.send({
      type: 'CRYPTO_TRIGGERED',
      quantity,
      priceETH: String(price),
      label: renderPurchaseItemLabel(quantity),
      imgSrc: '/media/purchase-screen/purchase-canvas.jpg',
      contractType: ContractTypes.Generations,
    });
  };

  return (
    <Elements stripe={stripePromise}>
      <StripePaymentStatus
        successMessage="Success! Your purchase will appear in your profile in a moment."
        replaceUrl="/generations"
      />
      <ReactModal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        className={styles.modal}
        style={{
          overlay,
        }}>
        <GenerationsClaimsModalContent
          onClose={onRequestClose}
          onPayClickCallback={onRequestClose}
          onFiatPurchase={onFiatPurchase}
          onCryptoPurchase={onCryptoPurchase}
        />
      </ReactModal>
    </Elements>
  );
};
