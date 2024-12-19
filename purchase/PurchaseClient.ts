import { StripeIntentResponse } from './types/StripeIntentResponse';
import { StripeIntentResponseSchema } from './schemas/StripeIntentResponse.schema';
import { BigNumber, Contract, ethers, Signer } from 'ethers';
import { ContractClient, ContractTypes } from './ContractClient';
import { QRTokensDetect } from '@/hooks/useQRTokensDetect';

const contractClient = new ContractClient();
const QRTokensDetectInstance = new QRTokensDetect();

export const GENERATIONS_SPECIAL_TOKEN = process.env.NEXT_PUBLIC_GENERATIONS_QR_TOKEN;
if (!GENERATIONS_SPECIAL_TOKEN) {
  throw new Error('Special token for the Generations is not specified. Please add env variables.');
}

const getGenerationsSpecialTokenData = (): string => {
  if (!GENERATIONS_SPECIAL_TOKEN) return '';

  const isSpecialTokenExist = QRTokensDetectInstance.checkToken(GENERATIONS_SPECIAL_TOKEN);

  return isSpecialTokenExist ? `&using_special_token=true&token=${GENERATIONS_SPECIAL_TOKEN}` : '';
};

const getStripeEndpointByContractType = (type: ContractTypes, quantity: number, isSet: boolean) => {
  switch (type) {
    case ContractTypes.Siebren:
      return `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/purchase/recent_history/stripe?quantity=${quantity}`;
    case ContractTypes.Generations:
      const specialTokenData = getGenerationsSpecialTokenData();
      return isSet
        ? `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/purchase/generations/stripe/sets?${specialTokenData}`
        : `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/purchase/generations/stripe?quantity=${quantity}${specialTokenData}`
    case ContractTypes.Nascent:
      return isSet
        ? `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/purchase/pills/stripe/sets`
        : `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/purchase/pills/stripe?quantity=${quantity}`
    case ContractTypes.FeelGoodSpins:
      return isSet
        ? `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/purchase/slots/stripe/sets?setType=${quantity === 3 ? 'a' : 'b'}`
        : `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/purchase/slots/stripe?quantity=${quantity}`
  }
};

export class PurchaseClient {
  constructor(private authTokenProvider: AuthTokenProviderPort) {}

  async attemptStripePurchase(
    quantity: number,
    contractType: ContractTypes,
    isSet: boolean = false
  ): Promise<StripeIntentResponse> {
    const token = await this.authTokenProvider.getAuthToken();
    const url = getStripeEndpointByContractType(contractType, quantity, isSet);

    if (!url) {
      throw new Error('Failed to get Stripe endpoint url');
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        bearer: token,
      },
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data?.message ?? 'Failed to get Stripe secret and USD amount from payment intent.');
    }
    const data = await res.json();
    const responseData = StripeIntentResponseSchema.parse(data);
    return responseData;
  }

  async purchaseByCrypto(
    quantity: number,
    price: string,
    signer: Signer,
    contractType: ContractTypes,
    isSet: boolean
  ): Promise<void> {
    try {
      const contractData = await contractClient.getContractAndStatusesByType(contractType, signer);
      const value = ethers.utils.parseEther(price);
      if (contractType === ContractTypes.FeelGoodSpins && contractData?.isPresale) {
        await this.purchaseByCryptoPrivateSaleFeelGoodSpins(quantity, value, contractData?.contract, isSet);
      } else {
        await this.purchaseByCryptoPublicSale(quantity, value, contractData?.contract, isSet);
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async revealSiebrenArtwork(tokenId: string, imageUuid: string): Promise<string> {
    const authToken = await this.authTokenProvider.getAuthToken();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/collection/recenthistory/token_reveal/${tokenId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          bearer: authToken,
        },
        body: JSON.stringify({ imageUuid }),
      },
    );
    if (!res.ok) {
      throw new Error(
        `Failed to reveal an image with UUID ${imageUuid} using token ${tokenId} for the Siebren project.`,
      );
    }
    const data = await res.json();
    return data.Image.url;
  }

  async swapThePill(tokenId: string): Promise<void> {
    const authToken = await this.authTokenProvider.getAuthToken();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/collection/pills/artworks/${tokenId}/change`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          bearer: authToken,
        }
      },
    );
    if (!res.ok) {
      throw new Error(
        `Failed to swap the pill with ID using token ${tokenId}.`,
      );
    }
  }

  async checkWLUserSignMessage(quantity: number, setType?: string): Promise<CheckWLUserSignMessageResponse> {
    const isSpecialTokenExist = !GENERATIONS_SPECIAL_TOKEN
      ? false
      : QRTokensDetectInstance.checkToken(GENERATIONS_SPECIAL_TOKEN);
    let url = isSpecialTokenExist
      ? `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/whitelist/${GENERATIONS_SPECIAL_TOKEN}/special_token_sign_message?quantity=${quantity}`
      : `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/whitelist/check_user_sign_message?quantity=${quantity}`;

    if (setType) {
      url += `&setType=${setType}`;
    }

    const token = await this.authTokenProvider.getAuthToken();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        bearer: token,
      },
    });

    const data = await res.json();
    return data;
  }

  async checkAvailableSlots(): Promise<number> {
    // https://prod-v2-api.arsnl.art/api/v1/whitelist/checkUser
    const token = await this.authTokenProvider.getAuthToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/whitelist/checkUser`, {
      method: 'GET',
      headers: {
        bearer: token,
      },
    });
    if (!res.ok) {
      throw new Error('Failed to check if the user is whitelisted.');
    }
    const { slots } = await res.json();
    return slots;
  }

  private async purchaseByCryptoPublicSale(quantity: number, value: BigNumber, contract: Contract, isSet: boolean) {
    const contractPromise = isSet
      ? contract.mintSet({ value })
      : contract.mint(quantity, { value });
    const res = await contractPromise;
    await res.wait();
  }

  private async purchaseByCryptoPrivateSaleFeelGoodSpins(quantity: number, value: BigNumber, contract: Contract, isSet: boolean) {
    if (isSet) {
      const { sign, message } = await this.checkWLUserSignMessage(quantity, quantity === 3 ? 'a' : 'b');
      const messageDecode = ethers.utils.base64.decode(message);
      const signDecode = ethers.utils.base64.decode(sign);
      const setType = quantity === 3 ? 0 : 1;
      const contractPromise = contract.mintSetPresale(setType, messageDecode, signDecode, { value });
      const res = await contractPromise;
      await res.wait();
    } else {
      const { sign, message } = await this.checkWLUserSignMessage(quantity);
      const messageDecode = ethers.utils.base64.decode(message);
      const signDecode = ethers.utils.base64.decode(sign);
      const contractPromise = contract.mintTokenPresale(quantity, messageDecode, signDecode, { value });
      const res = await contractPromise;
      await res.wait();
    }
  }
}

interface AuthTokenProviderPort {
  getAuthToken(): Promise<string>;
}

interface CheckWLUserSignMessageResponse {
  message: string;
  sign: string;
}
