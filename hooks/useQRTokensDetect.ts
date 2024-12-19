import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const LOCAL_STORAGE_TOKENS_KEY = 'arsnl_router_query';

export class QRTokensDetect {
  constructor() {}

  getSavedTokensList(): string[] {
    const savedUserTokensString =
      typeof window !== 'undefined' ? window.localStorage.getItem(LOCAL_STORAGE_TOKENS_KEY) || '' : '';
    const tokens: string[] = savedUserTokensString.length ? JSON.parse(savedUserTokensString) : [];

    return tokens;
  }

  saveNewTokensList(tokens: string[]) {
    typeof window !== 'undefined' && window.localStorage.setItem(LOCAL_STORAGE_TOKENS_KEY, JSON.stringify(tokens));
  }

  checkToken(token: string): boolean {
    const tokens = this.getSavedTokensList();
    return tokens.includes(token.trim());
  }

  deleteToken(token: string) {
    const tokens = this.getSavedTokensList();
    const newTokens = tokens.filter((t) => t !== token);
    this.saveNewTokensList(newTokens);
  }
}

const QRTokensDetectInstance = new QRTokensDetect();

export const useQRTokensDetect = (token?: string) => {
  const router = useRouter();
  const [isSpecialToken, setIsSpecialToken] = useState(false);

  useEffect(() => {
    const tokenQuery = (router.query?.qr as string) || '';
    if (tokenQuery) {
      const tokens = QRTokensDetectInstance.getSavedTokensList();
      const newTokens = tokens.includes(tokenQuery) ? tokens : [...tokens, tokenQuery];
      QRTokensDetectInstance.saveNewTokensList(newTokens);
    }
  }, []);

  useEffect(() => {
    if (token) {
      setIsSpecialToken(QRTokensDetectInstance.checkToken(token));
    }
  }, [token]);

  return { isSpecialToken };
};
