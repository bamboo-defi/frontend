export interface Pair {
  id: string;
  logoTokenFirst: string;
  logoTokenSecond: string;
  pairTokenNameFirst: string;
  pairTokenNameSecond: string;
  addressTokenFirst: string;
  addressTokenSecond: string;
  pairAddress: string;
  liquidity: number;
  liquidityPercentaje: number;
  volume24: number;
  volume24Percentaje: number;
  volume7: number;
  volume7Percentaje: number;
  fees24: number;
  fees24Percentaje: number;
  feesYear: number;
  feesYearPercentaje: number;
  pairFirstEqualSecond: number;
  pairSecondEqualFirst: number;
  ammountFirst: number;
  ammountSecond: number;
}
