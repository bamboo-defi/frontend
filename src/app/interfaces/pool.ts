export interface Pool {
  id: string;
  logo: string;
  title: string;
  pair: string;
  address: string;
  logoTokenFirst: string;
  logoTokenSecond: string;
  addressTokenFirst: string;
  addressTokenSecond: string;
  underlyingToken: number;
  underlyingTokenFirst: string;
  underlyingTokenSecond: string;
  underlyingTokenFirstValue: number;
  underlyingTokenSecondValue: number;
  underlyingBamboo: number;
  value: number;
  yield: number;
  yieldReward: number;
  roiDaily: number;
  roiMonthly: number;
  roiYearly: number;
  tvl: number;
  available: number;
  staked: number;
  reward: number;
  isActive: boolean;
}
