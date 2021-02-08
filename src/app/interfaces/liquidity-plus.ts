export interface LiquidityPlus {
  inputFirst: number;
  inputSecond: number;
  firstPerSecond: string;
  secondPerFirst: string;
  shareOfPool: string;
  tokenFirst: {
    icon: string;
    name: string;
    addr: string;
  };
  tokenSecond: {
    icon: string;
    name: string;
    addr: string;
  };
  inputBalanceFirst: string;
  inputBalanceSecond: string;
  position: string;
  positionFirst: string;
  positionSecond: string;
}
