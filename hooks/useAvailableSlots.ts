import { useEffect, useState } from 'react';
import { ContractStatusEnum } from '@/purchase/types/ContractStatus';
import { useAuth } from '@/hooks/useAuth';
import { AuthClient } from '@/auth/AuthClient';
import { PurchaseClient } from '@/purchase/PurchaseClient';

const authClient = new AuthClient();
const purchaseClient = new PurchaseClient(authClient);

export const useAvailableSlots = (loaded: boolean, status: ContractStatusEnum) => {
  const { isAuthenticated } = useAuth();
  const [availableSlots, setAvailableSlots] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!isAuthenticated || !loaded) return;
    if (status !== ContractStatusEnum.presale) return;

    purchaseClient.checkAvailableSlots().then((slots) => {
      setAvailableSlots(slots);
    });
  }, [isAuthenticated, loaded, status]);

  return { availableSlots };
};
