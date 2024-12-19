import { useCallback, useEffect, useMemo, useState } from 'react';
import { Contract, ethers } from 'ethers';
import { ContractClient } from '@/purchase/ContractClient';
import { ContractStatusData, ContractStatusEnum } from '@/purchase/types/ContractStatus';
import { useSigner } from '@/hooks';

interface UseGenerationsContractReturnValue extends ContractStatusData {
  contract: Contract | undefined;
  price: number | undefined;
}

const contractClient = new ContractClient();

const defaultContractStatus: ContractStatusData & { price: number | undefined } = {
  status: ContractStatusEnum.notStarted,
  soldOut: false,
  loaded: false,
  price: undefined,
};

export function useGenerationsContract(): UseGenerationsContractReturnValue {
  const signer = useSigner();

  const contract = useMemo(() => {
    if (!signer) return;
    return contractClient.getGenerationsContract(signer);
  }, [signer]);

  const [contractStatus, setContractStatus] = useState<ContractStatusData & { price: number | undefined }>(
    defaultContractStatus,
  );

  const fetchContract = useCallback(async () => {
    if (!contract) return;

    const [isPrivateSaleActive, isPublicSaleActive, totalSupplyInt, priceBigNumber, presaleLimit, limitEmissionInt] =
      await Promise.all([
        contract.getPrivateSaleStatus(),
        contract.getPublicSaleStatus(),
        contract.totalSupply(),
        contract.getPrice(),
        contract.getPresaleLimit(),
        contract.getLimitEmission(),
      ]);

    const totalSupply = Number(ethers.utils.formatUnits(totalSupplyInt, 0));
    const limitEmission = Number(ethers.utils.formatUnits(limitEmissionInt, 0));
    const availableClaims = limitEmission - totalSupply;

    setContractStatus({
      status: isPublicSaleActive
        ? ContractStatusEnum.public
        : isPrivateSaleActive
        ? ContractStatusEnum.presale
        : ContractStatusEnum.notStarted,
      loaded: true,
      soldOut: availableClaims === 0,
      price: parseFloat(ethers.utils.formatEther(priceBigNumber)),
    });
  }, [contract]);

  useEffect(() => {
    fetchContract().catch((e) => {
      console.error(e);
    });
  }, [fetchContract]);

  return { contract, ...contractStatus };
}
