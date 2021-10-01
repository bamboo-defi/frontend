import { Injectable } from '@angular/core';
import { PairData, TokenData, TokenDataDetail } from '../../../interfaces/contracts';
import BigNumber from 'bignumber.js';
import { PairTransaction } from '../../../interfaces/pair-transaction';
import { NetworkService } from 'src/app/services/contract-connection/network.service';
import * as TokenConstants from '../../../constants/token.constants';

const abiDecoder = require('abi-decoder');
const RouterAbi = require('../abi/UniswapV2Router02.json');

@Injectable({
  providedIn: 'root'
})
// Service that makes offchain calculations for contract methods
export class UtilService {

  addresses;

  constructor(
    private networkService: NetworkService
  ) {
    this.addresses = networkService.getAddressNetwork();
  }

  // This function will only work with swaps of two tokens
  filterPairTx(pairData: PairData, tokenData0: TokenDataDetail, tokenData1: TokenDataDetail, transaction: any): PairTransaction {
    try {
      abiDecoder.addABI(RouterAbi);
      const decodedData = abiDecoder.decodeMethod(transaction.input);
      // If not a transaction or not a successful transaction
      if (!decodedData || transaction.txreceipt_status !== '1') {
        return undefined;
      }
      const newTx: PairTransaction = {
        id: transaction.hash,
        name: tokenData0.name.concat('-', tokenData1.name),
        type: '',
        totalValue: 0.0,
        tokenName1: tokenData0.name,
        tokenAmmount1: 0,
        tokenName2: tokenData1.name,
        tokenAmmount2: 0,
        hash: transaction.hash,
        timeStamp: transaction.timeStamp,
        from: '',
        to: '',
        blockNumber: 0,
        contractAddress: '',
        poolId: 0
      };
      let inValue;
      let outValue;
      let tokenA;
      let tokenB;
      // filter types of transaction
      if (decodedData.name.toString().includes('swap')) {
        // Filter if this tx is from the pair that we want
        const path = decodedData.params.find(i => i.name === 'path');
        if (path !== undefined) {
          tokenA = path.value[0];
          tokenB = path.value[1];
        }
        if (!this.isMatchingPair(pairData, tokenA, tokenB)) { return undefined; }
        // switch types of operation
        switch (decodedData.name.toString()) {
          case 'swapExactTokensForTokens':
            inValue = decodedData.params.find(i => i.name === 'amountIn');
            outValue = decodedData.params.find(i => i.name === 'amountOutMin');
            break;
          case 'swapTokensForExactTokens':
            inValue = decodedData.params.find(i => i.name === 'amountInMax');
            outValue = decodedData.params.find(i => i.name === 'amountOut');
            break;
          case 'swapExactTokensForETH':
            inValue = decodedData.params.find(i => i.name === 'amountIn');
            outValue = decodedData.params.find(i => i.name === 'amountOutMin');
            // Arreglo Bamboo-WETH
            //            outValue = transaction;
            break;
          case 'swapETHForExactTokens':
            inValue = transaction;
            outValue = decodedData.params.find(i => i.name === 'amountOut');
            break;
          case 'swapTokensForExactETH':
            inValue = decodedData.params.find(i => i.name === 'amountInMax');
            outValue = decodedData.params.find(i => i.name === 'amountOut');
            break;
          case 'swapExactETHForTokens':
            inValue = transaction;
            outValue = decodedData.params.find(i => i.name === 'amountOutMin');
            break;
          default:
            return undefined;
        }
        newTx.type = 'SWAP';
      }
      else if (decodedData.name.toString().includes('add')) {
        const valid = this.validateAddRemovePairs(decodedData, pairData);
        if (valid === undefined) {
          return undefined;
        }
        tokenA = valid[0];
        tokenB = valid[1];
        switch (decodedData.name.toString()) {
          case 'addLiquidity':
            inValue = decodedData.params.find(i => i.name === 'amountADesired');
            outValue = decodedData.params.find(i => i.name === 'amountBDesired');
            break;
          case 'addLiquidityETH':
            inValue = decodedData.params.find(i => i.name === 'amountTokenDesired');
            outValue = transaction;
            break;
          default:
            return undefined;
        }
        newTx.type = 'ADD';
      }
      else if (decodedData.name.toString().includes('remove')) {
        const valid = this.validateAddRemovePairs(decodedData, pairData);
        if (valid === undefined) {
          return undefined;
        }
        tokenA = valid[0];
        tokenB = valid[1];
        if (!this.isMatchingPair(pairData, tokenA, tokenB)) { return undefined; }
        switch (decodedData.name.toString()) {
          case 'removeLiquidity':
            inValue = decodedData.params.find(i => i.name === 'amountAMin');
            outValue = decodedData.params.find(i => i.name === 'amountBMin');
            break;
          case 'removeLiquidityETH':
            inValue = decodedData.params.find(i => i.name === 'amountTokenMin');
            outValue = decodedData.params.find(i => i.name === 'amountETHMin');
            break;
          default:
            return undefined;
        }
        newTx.type = 'REMOVE';
      }
      else {
        // Other type of transaction
        return undefined;
      }
      // swap if token order is reversed
      if (!this.compareEthAddr(tokenA, tokenData0.addr)) {
        newTx.tokenName1 = tokenData1.name;
        newTx.tokenName2 = tokenData0.name;
        newTx.name = tokenData1.name.concat('-', tokenData0.name);
        newTx.tokenAmmount1 = this.fromWeiToNumber(inValue.value, tokenData1.decimals);
        newTx.tokenAmmount2 = this.fromWeiToNumber(outValue.value, tokenData0.decimals);
      }
      else {
        newTx.tokenAmmount1 = this.fromWeiToNumber(inValue.value, tokenData0.decimals);
        newTx.tokenAmmount2 = this.fromWeiToNumber(outValue.value, tokenData1.decimals);
      }
      return newTx;
    } catch (e) {
      return undefined;
    }
  }

  private isMatchingPair(pairData: PairData, tokenA: any, tokenB: any): boolean {
    if (tokenA === undefined || tokenB === undefined) {
      return false;
    }
    if (!this.areArraysEqualSets([tokenA.toLowerCase(), tokenB.toLowerCase()],
      [pairData.token0.toLowerCase(), pairData.token1.toLowerCase()])) {
      return false;
    }
    return true;
  }

  private validateAddRemovePairs(decodedData: any, pairData: PairData): any[] {
    let tokenA;
    let tokenB;
    let inA = decodedData.params.find(i => i.name === 'tokenA');
    const inB = decodedData.params.find(i => i.name === 'tokenB');
    // Case ETH
    if (inA === undefined && inB === undefined) {
      // Special case of add/remove liquidity with ETH
      inA = decodedData.params.find(i => i.name === 'token');
      if (inA === undefined) {
        return undefined;
      }
      tokenA = inA.value;
      tokenB = this.addresses.weth_address;
    }
    else {
      tokenA = inA.value;
      tokenB = inB.value;
    }
    if (!this.isMatchingPair(pairData, tokenA, tokenB)) { return undefined; }
    return [tokenA, tokenB];
  }

  fromWeiToNumber(amount: string, decimals: number = 18): number {
    const bn = new BigNumber(amount).shiftedBy(-decimals);
    return Number(bn.toFixed(3));
  }

  fromWeiToBN(amount: string, decimals: number = 18): BigNumber {
    return new BigNumber(amount).shiftedBy(-decimals);
  }

  fromBNtoWei(amount: BigNumber, decimals: number = 18): string {
    const res = new BigNumber(amount).shiftedBy(decimals);
    return res.integerValue(1).toFixed(0, 1);
  }

  fromBNtoNumber(amount: BigNumber, decimals: number = 3): number {
    const bn = new BigNumber(amount);
    return Number(bn.toFixed(decimals));
  }

  getOtherAmountOfPair(amount: BigNumber, token: string, pairData: PairData): BigNumber {
    // Identify which token of the pair
    if (this.compareEthAddr(token, pairData.token0)) {
      return amount.times(pairData.reserve1).dividedBy(pairData.reserve0);
    } else if (this.compareEthAddr(token, pairData.token1)) {
      return amount.times(pairData.reserve0).dividedBy(pairData.reserve1);
    }
    else {
      // This should never reach
      throw Error('token does not exist in pair');
    }
  }

  // Estimate amounts based on fee
  getAmountOut(amountIn: BigNumber, tokenIn: TokenData, pairData: PairData): BigNumber {
    // Determine which reserve is In/out
    let reserveIn = pairData.reserve0;
    let reserveOut = pairData.reserve1;
    if (!this.compareEthAddr(tokenIn.addr, pairData.token0)) {
      reserveIn = pairData.reserve1;
      reserveOut = pairData.reserve0;
    }
    const feeAmount = amountIn.times(1000 - pairData.fee);
    const aOut = (feeAmount.times(reserveOut)).dividedBy((reserveIn.times(1000)).plus(feeAmount));
    // Sanity checks
    if (aOut.isGreaterThan(reserveOut)) {
      return new BigNumber(0);
    }
    return aOut;
  }

  getAmountIn(amountOut: BigNumber, tokenOut: TokenData, pairData: PairData): BigNumber {
    // Determine which reserve is In/out
    let reserveIn = pairData.reserve0;
    let reserveOut = pairData.reserve1;
    if (!this.compareEthAddr(tokenOut.addr, pairData.token1)) {
      reserveIn = pairData.reserve1;
      reserveOut = pairData.reserve0;
    }
    // Sanity checks
    if (amountOut.isGreaterThan(reserveOut)) {
      return new BigNumber(0);
    }
    const num = reserveIn.times(amountOut).times(1000);
    return (num.dividedBy((reserveOut.minus(amountOut)).times(1000 - pairData.fee))).plus(new BigNumber(1).shiftedBy(-tokenOut.decimals));
  }

  // Compare two ETH addresses
  compareEthAddr(A: string, B: string): boolean {
    return A.toLowerCase() === B.toLowerCase();
  }

  validateInput(input: number): boolean {
    const isNaN = Number.isNaN(input);
    if (isNaN || input <= 0) {
      return false;
    }
    return true;
  }

  getPriceImpact(amountIn: BigNumber, fee: number, reserveIn: BigNumber): string {
    const pI = (amountIn.times((100 - fee) / 100).dividedBy(reserveIn)).times(100);
    return pI.toFixed(3);
  }

  // Check if pair of tokens are the same even if not in order. Linear time
  areArraysEqualSets(a1: string[], a2: string[]): boolean {
    const superSet = {};
    for (const i of a1) {
      const e = i + typeof i;
      superSet[e] = 1;
    }

    for (const i of a2) {
      const e = i + typeof i;
      if (!superSet[e]) {
        return false;
      }
      superSet[e] = 2;
    }

    for (let e in superSet) {
      if (superSet[e] === 1) {
        return false;
      }
    }

    return true;
  }

  getIdTokenForCoinGeckoAPI(token): string {
    switch (token) {
      case TokenConstants.BAMBOO:
        return TokenConstants.ID_BAMBOO;
      case TokenConstants.USDT:
        return TokenConstants.ID_USDT;
      case TokenConstants.WETH:
        return TokenConstants.ID_WETH;
      case TokenConstants.DAI:
        return TokenConstants.ID_DAI;
      case TokenConstants.WBTC:
        return TokenConstants.ID_WBTC;
    }
  }

  /**
   * In this function, the tokenlist have been divided in two pieces, important tokens and other tokens.
   * The slice for other tokens has been ordered alphabetically. REMEMBER!! If JSON changes, the function
   * needs a change in the index of slices.
   * @param tokenList
   */
  sortTokenListBySymbol(tokenList: any[]): any[] {
    // This slices get all tokens with pool excluding WETH
    const tokensWithPool = tokenList.slice(0, 1).concat(tokenList.slice(2, 7));
    const otherTokens = tokenList.slice(1, 2).concat(tokenList.slice(7, tokenList.length));
    otherTokens.sort((tL1, tL2) => {
      let value = 0;
      if (tL1.symbol > tL2.symbol) {
        value = 1;
      }
      if (tL1.symbol < tL2.symbol) {
        value = -1;
      }
      return value;
    });
    return tokensWithPool.concat(otherTokens);
  }

  sortByTime(stakingList: any[]): any[] {
    stakingList.sort((tL1, tL2) => {
      let value = 0;
      if (tL1.daysTo > tL2.daysTo) {
        value = 1;
      }
      if (tL1.daysTo < tL2.daysTo) {
        value = -1;
      }
      return value;
    });
    return stakingList;
  }
}
