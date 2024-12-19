import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';

export const useSigner = () => {
  const { library } = useWeb3React();
  const signer = useMemo(() => {
    if (!library) return;
    return library.getSigner();
  }, [library]);

  return signer;
};
