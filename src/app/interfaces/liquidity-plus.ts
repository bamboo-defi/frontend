export interface LiquidityPlus {
  inputFirst: number;
  inputSecond: number;
  firstPerSecond: string;
  secondPerFirst: string;
  poolAllocation: string;
  shareOfPool: string;
  tokenFirst: {
    icon: string;
    name: string;
    addr: string;
    isEth: boolean;
  };
  tokenSecond: {
    icon: string;
    name: string;
    addr: string;
    isEth: boolean;
  };
  inputBalanceFirst: string;
  inputBalanceSecond: string;
  position: string;
  positionFirst: string;
  positionSecond: string;
}
