export interface Vault {
  balance: {type: number, default: 0};
  bbyp: {type: number, default: 0};
  burn: {type: number, default: 0};
  burnBBYP: {type: number, default: 0};
  burnTotal: {type: number, default: 0};
  burnLastBlock: {type: number, default: 0};
  charity: {type: number, default: 0};
  developers: {type: number, default: 0};
  fees24: {type: number, default: 0};
  totalFees: {type: number, default: 0};
}
