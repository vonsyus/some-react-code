import { ChangeEvent, ChangeEventHandler, FC, useState } from 'react';
import { ContractStatusEnum, PaymentMethod } from '@/purchase/types';
import { useGenerationsContract } from '@/hooks/useGenerationsContract';
import { Checkmark, Close } from '@/components/icons/Icons';
import cn from 'classnames';
import { ShadowButton } from '@/components/ShadowButton/ShadowButton';
import { PurchasePackData, PurchasePackIdsEnum, PurchasePackTypesEnum } from '@/purchase/types/PurchasePack';
import {
  GENERATIONS_PURCHASE_ARTWORKS_IN_SET_AMOUNT,
  GENERATIONS_PURCHASE_CUSTOM_LIMITS,
  GENERATIONS_PURCHASE_CUSTOM_PACK,
  GENERATIONS_PURCHASE_PACKS,
  GENERATIONS_PURCHASE_ARTWORK_PRICE_USD,
  GENERATIONS_PURCHASE_SINGLE_PACK,
  GENERATIONS_PURCHASE_SET_PRICE_USD,
} from '@/purchase/configs/generations';
import { useAuth, useAvailableSlots, useQRTokensDetect } from '@/hooks';
import { GENERATIONS_SPECIAL_TOKEN } from '@/purchase/PurchaseClient';

type Props = {
  onClose(): void;
  availableSlots?: number;
  onPayClickCallback?: () => void;
  onFiatPurchase: (quantity: number, isSet: boolean) => void;
  onCryptoPurchase: (quantity: number, price: number) => void;
};

type PackTileProps = {
  onClick: (packData: PurchasePackData) => void;
  packData: PurchasePackData;
  selectedPack: PurchasePackData;
  customPackValue: string;
  setCustomPackValue: (event: ChangeEvent<HTMLInputElement>) => void;
};
const PackTile: FC<PackTileProps> = (props) => {
  const { onClick, packData, selectedPack, customPackValue, setCustomPackValue } = props;
  const isCurrent = selectedPack.id === packData.id;
  const isCustom = packData.id === PurchasePackIdsEnum.custom;
  const onClickForCustom = () => customPackValue && onClick(packData);

  return (
    <div
      onClick={() => (isCustom ? onClickForCustom() : onClick(packData))}
      className={cn('FALTHowTo-option-block h5-desktop h4-mobile', {
        'FALTHowTo-option-block-selected': isCurrent,
      })}>
      {isCustom ? (
        <div className="FALTHowTo-centered-block">
          <input
            value={customPackValue}
            type="number"
            className="FALTHowTo-input h5-desktop h4-mobile"
            onChange={setCustomPackValue}
            min={GENERATIONS_PURCHASE_CUSTOM_LIMITS.min}
            max={GENERATIONS_PURCHASE_CUSTOM_LIMITS.max}
          />
          <h5 className="h5-desktop h4-mobile">PACK</h5>
        </div>
      ) : (
        packData.label
      )}

      {isCurrent && (
        <div className="FALTHowTo-checkmark-wrapper">
          <Checkmark classname="FALTHowTo-checkmark" />
        </div>
      )}

      {isCustom && (
        <p
          className={cn('FALTHowTo-select-paragraph p-desktop p-mobile', {
            // 'FALTHowTo-hidden': selectedPack === o[0],
          })}>
          Enter custom amount
        </p>
      )}
    </div>
  );
};

type PaymentWaysTileProps = {
  selectedCurrency: PaymentMethod;
  setSelectedCurrency: (currency: PaymentMethod) => void;
  selectedPack: PurchasePackData;
  price: number;
  isHidden?: boolean;
};
const PaymentWaysTile: FC<PaymentWaysTileProps> = (props) => {
  const { selectedPack, selectedCurrency, setSelectedCurrency, price, isHidden } = props;

  return (
    <div className="FALTHowTo-payment-info">
      <div>
        <p className="h8-desktop h8-mobile">CHOOSE PAYMENT</p>
        <div className="FALTHowTo-currency-wrapper">
          {selectedPack.payment.includes(PaymentMethod.ETH) && (
            <button
              className={cn('FALTHowTo-currency h5-desktop h5-mobile', {
                'FALTHowTo-currency-selected': selectedCurrency === PaymentMethod.ETH,
              })}
              onClick={() => setSelectedCurrency(PaymentMethod.ETH)}>
              ETH
            </button>
          )}

          {selectedPack.payment.length > 1 && <span>or</span>}

          {selectedPack.payment.includes(PaymentMethod.USD) && (
            <button
              className={cn('FALTHowTo-currency h5-desktop h5-mobile', {
                'FALTHowTo-currency-selected': selectedCurrency === PaymentMethod.USD,
              })}
              onClick={() => setSelectedCurrency(PaymentMethod.USD)}>
              CREDIT CARD
            </button>
          )}
        </div>

        <div style={{ opacity: selectedPack.payment.includes(PaymentMethod.ETH) ? 0 : 1 }}>
          Our singles have MINTED OUT!  We are only selling sets now.  You can <a href='https://opensea.io/collection/generations-annalucia-geesbend' target='_blank' rel='noreferrer'>buy singles on OpenSea</a>.
          <br /><br />
          To buy a set, click the left hand side then click pay.  A set is a special curated package. Each set is hand-arranged into a theme by Anna Lucia. It includes 1 quilt
          from each of the 4 quilters (4-pack), plus a rare {"'Album Quilt'"} that visually encapsulates the set. These
          Album Quilts are capped at 40 unique generations.
          <br />
          <br />
          This is a credit card purchase. If you are interested in paying by eth, please use this {' '}
          <a
              href="https://commerce.coinbase.com/checkout/7aac8ad8-7e04-4dad-987c-9b4c68007725"
              target="_blank"
              rel="noreferrer">
            coinbase
          </a> link and we will deliver your set within 24 hours.

        </div>
      </div>

      <div className="FALTHowTo-total-wrapper" style={{ opacity: isHidden ? 0 : 1 }}>
        <p className="h8-desktop h8-mobile">TOTAL</p>
        <h5 className="FALTHowTo-price h5-desktop h5-mobile">
          {selectedCurrency === PaymentMethod.ETH ? `Ξ${price}` : `$${price}`}
        </h5>
      </div>
    </div>
  );
};

const getAmountByPackType = (selectedPack: PurchasePackData, customPackValue: string): number => {
  const isCustomPackEnabled = selectedPack.id === PurchasePackIdsEnum.custom;

  if (isCustomPackEnabled) return Number(customPackValue);

  return selectedPack.amount;
};

const areEnoughSlots = (availableSlots: number = 0, selectedPack: PurchasePackData) => {
  if (selectedPack.type === PurchasePackTypesEnum.set) {
    return availableSlots >= GENERATIONS_PURCHASE_ARTWORKS_IN_SET_AMOUNT;
  }

  return availableSlots >= selectedPack.amount;
};

export const GenerationsClaimsModalContent: FC<Props> = (props) => {
  const { onClose, onPayClickCallback, onFiatPurchase, onCryptoPurchase } = props;
  const [selectedPack, setSelectedPack] = useState<PurchasePackData>(GENERATIONS_PURCHASE_PACKS[0]);
  const [customPackValue, setCustomPackValue] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<PaymentMethod>(PaymentMethod.ETH);
  const { status, price: ethPrice, loaded } = useGenerationsContract();
  const isCustomPackEnabled = selectedPack.id === PurchasePackIdsEnum.custom;
  const isSetPackEnabled = selectedPack.id === PurchasePackIdsEnum.set;
  const amountForPriceCalculation = getAmountByPackType(selectedPack, customPackValue);
  const price = getPrice(
    amountForPriceCalculation,
    selectedCurrency,
    ethPrice || 0,
    isSetPackEnabled ? GENERATIONS_PURCHASE_SET_PRICE_USD : GENERATIONS_PURCHASE_ARTWORK_PRICE_USD,
  );
  const { isWalletLocked } = useAuth();
  const { isSpecialToken } = useQRTokensDetect(GENERATIONS_SPECIAL_TOKEN);
  const { availableSlots = 0 } = useAvailableSlots(loaded, status);
  const dontHaveAvailablePresaleSlots =
    !areEnoughSlots(availableSlots, selectedPack) && status === ContractStatusEnum.presale && !isSpecialToken;

  const onChangePack = (packData: PurchasePackData) => {
    if (!packData.payment.includes(selectedCurrency)) {
      setSelectedCurrency(packData.payment[0]);
    }
    setSelectedPack(packData);
  };

  const onPayClick = () => {
    if (!price || isWalletLocked || dontHaveAvailablePresaleSlots) return;
    onPayClickCallback && onPayClickCallback();

    const amount = isCustomPackEnabled ? Number(customPackValue) : selectedPack.amount;

    switch (selectedCurrency) {
      case PaymentMethod.USD:
        onFiatPurchase(amount, isSetPackEnabled);
        break;
      case PaymentMethod.ETH:
        onCryptoPurchase(amount, price);
        break;
    }
  };

  const onCustomInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { value } = e.target;

    // enable single if value is incorrect
    if (!Number(value)) {
      onChangePack(GENERATIONS_PURCHASE_SINGLE_PACK);
      setCustomPackValue('');
      return;
    }

    // check limits
    if (
      Number(value) < GENERATIONS_PURCHASE_CUSTOM_LIMITS.min ||
      Number(value) > GENERATIONS_PURCHASE_CUSTOM_LIMITS.max
    )
      return;

    const valueNum = Number(value.replace(/[^0-9]/g, '').slice(0, 2));
    if (valueNum >= GENERATIONS_PURCHASE_CUSTOM_LIMITS.min && valueNum <= GENERATIONS_PURCHASE_CUSTOM_LIMITS.max) {
      setCustomPackValue(valueNum.toString());
    } else {
      setCustomPackValue('');
    }

    onChangePack(GENERATIONS_PURCHASE_CUSTOM_PACK);
  };

  const isPayDisabled =
    dontHaveAvailablePresaleSlots || (isCustomPackEnabled && !customPackValue) || !price || isWalletLocked;

  return (
    <div>
      <div className="FALTHowTo-direction h8-desktop h8-mobile">
        Select your purchase option
        <button className="button-unstyled" onClick={onClose}>
          <Close classname="FALTHowTo-close" color="#000000" />
        </button>
      </div>
      <div className="FALTHowTo-options-wrapper">
        <div className="FALTHowTo-wrapper">
          {GENERATIONS_PURCHASE_PACKS.map((packData) => (
            <PackTile
              key={packData.id}
              onClick={onChangePack}
              packData={packData}
              selectedPack={selectedPack}
              customPackValue={customPackValue}
              setCustomPackValue={onCustomInputChange}
            />
          ))}
        </div>

        <div className="FALTHowTo-pay-block">
          <PaymentWaysTile
            selectedCurrency={selectedCurrency}
            setSelectedCurrency={setSelectedCurrency}
            selectedPack={selectedPack}
            price={price || 0}
            isHidden={isWalletLocked}
          />

          <ShadowButton type="button" className="FALTHowTo-pay-button" onClick={onPayClick} disabled={isPayDisabled}>
            Pay
          </ShadowButton>
          {dontHaveAvailablePresaleSlots && (
            <div className="FALTHowTo-pay-button-msg" data-available-slots={availableSlots}>
              Please wait until the public sale to buy more with this wallet.
            </div>
          )}
          {isWalletLocked && <div className="FALTHowTo-pay-button-msg">Please, unlock your wallet.</div>}
        </div>
      </div>
    </div>
  );
};

function getPrice(
  selectedQ: number | undefined,
  selectedCurrency: PaymentMethod,
  claimPriceETH: number,
  claimPriceUSD: number,
): number | undefined {
  if (!selectedQ) return;
  return selectedCurrency === PaymentMethod.ETH
    ? (claimPriceETH * 10000 * selectedQ) / 10000
    : claimPriceUSD * selectedQ;
}
