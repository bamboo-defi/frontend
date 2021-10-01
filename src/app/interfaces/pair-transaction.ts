export interface PairTransaction {
  id: string;
  name: string;
  type: string;
  totalValue: number;
  tokenName1: string;
  tokenAmmount1: number;
  tokenName2: string;
  tokenAmmount2: number;
  from: string;
  to: string;
  hash: string;
  blockNumber: number;
  timeStamp: string;
  contractAddress: string;
  poolId: number;
}
