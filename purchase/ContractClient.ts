import {ContractInterface, ethers, Signer } from 'ethers';
import siebrenAbi from './RecentHistory.json';
import generationsAbi from './generationsAbi.json';
import nascentAbi from './nascentAbi.json';
import feelGoodSpinsAbi from './feelGoodSpinsAbi.json';
import { FeelGoodSpinsContractStatusEnum } from "@/purchase/types";

export enum ContractTypes {
  Siebren = 'Siebren',
  Generations = 'Generations',
  Nascent = 'Nascent',
  FeelGoodSpins = 'FeelGoodSpins',
}

export class ContractClient {
  getSiebrenContract(signer: Signer) {
    const contractAddress = process.env.NEXT_PUBLIC_FALT_CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error('FALT contract address is not set in env variables.');
    }
    return this.getContract(contractAddress, siebrenAbi.abi, signer);
  }

  getGenerationsContract(signer: Signer) {
    const contractAddress = process.env.NEXT_PUBLIC_GENERATIONS_CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error('Generations contract address is not set in env variables.');
    }
    return this.getContract(contractAddress, generationsAbi, signer);
  }

  getNascentContract(signer: Signer) {
    const contractAddress = process.env.NEXT_PUBLIC_NASCENT_CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error('Nascent contract address is not set in env variables.');
    }
    return this.getContract(contractAddress, nascentAbi, signer);
  }

  getFeelGoodSpinsContract(signer: Signer) {
    const contractAddress = process.env.NEXT_PUBLIC_FEEL_GOOD_SPINS_CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error('Slots contract address is not set in env variables.');
    }
    return this.getContract(contractAddress, feelGoodSpinsAbi, signer);
  }

  getContractByType(type: ContractTypes, signer: Signer) {
    if (type === ContractTypes.Siebren) return this.getSiebrenContract(signer);
    if (type === ContractTypes.Generations) return this.getGenerationsContract(signer);
    if (type === ContractTypes.Nascent) return this.getNascentContract(signer);
    if (type === ContractTypes.FeelGoodSpins) return this.getFeelGoodSpinsContract(signer);

    throw new Error(`We don't have the ${type} contract`);
  }

  async getContractAndStatusesByType(type: ContractTypes, signer: Signer) {
    const contract = this.getContractByType(type, signer);
    const statuses = await this.getContractStatusesByType(type, contract);

    return { contract, ...statuses };
  }

  getContractStatusesByType(type: ContractTypes, contract: ethers.Contract) {
    if (type === ContractTypes.Siebren) return this.getSiebrenContractStatuses(contract);
    if (type === ContractTypes.Generations) return this.getGenerationsContractStatuses(contract);
    if (type === ContractTypes.FeelGoodSpins) return this.getFeelGoodSpinsContractStatuses(contract);
  }
  private async getGenerationsContractStatuses(contract: ethers.Contract) {
    const isPresale = await contract.getPrivateSaleStatus();
    const isPublic = await contract.getPublicSaleStatus();

    return { isPresale, isPublic };
  }
  private async getSiebrenContractStatuses(contract: ethers.Contract) {
    const isPresale = await contract.isPrivateSaleActive();
    const isPublic = await contract.isPublicSaleActive();

    return { isPresale, isPublic };
  }
  private async getFeelGoodSpinsContractStatuses(contract: ethers.Contract) {
    const currentSaleStatus = await contract.getSaleStatus();
    const isPresale = currentSaleStatus === FeelGoodSpinsContractStatusEnum.PRIVATE_STAGE_1 || currentSaleStatus === FeelGoodSpinsContractStatusEnum.PRIVATE_STAGE_2;
    const isPublic = currentSaleStatus === FeelGoodSpinsContractStatusEnum.PUBLIC;

    return { isPresale, isPublic };
  }

  private getContract(contractAddress: string, generationsAbi: ContractInterface, signer: Signer) {
    return new ethers.Contract(contractAddress, generationsAbi, signer);
  }
}
