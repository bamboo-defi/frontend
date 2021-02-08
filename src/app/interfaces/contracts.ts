// Interfaces used or returned by contracts
import BigNumber from 'bignumber.js';

export interface LiquidityResponse{
  amountA: BigNumber;
  amountB: BigNumber;
  liquidityAmount: string;
}

export interface LiquidityValue {
  tokenA: TokenData;
  amountA: BigNumber;
  tokenB: TokenData;
  amountB: BigNumber;
}

export interface PairData {
  reserve0: BigNumber;
  reserve1: BigNumber;
  token0: string;
  token1: string;
  addr: string;
  fee: number;
}

export interface TokenData {
  balance: BigNumber;
  addr: string;
  decimals: number;
  isEth: boolean;
}

export interface TokenDataDetail {
  name: string;
  addr: string;
  decimals: number;
  isEth: boolean;
}

export interface DepositInfo {
  amount: BigNumber;
  withdrawTime: number;
}

export interface BambooStakeBonus {
  claimableNow: BigNumber;
  claimableFuture: BigNumber;
}

export interface FieldUserInfo {
  isActive: boolean;
  poolId: string;
  startTime: number;
  amount: BigNumber;
  endTime: number;

}

