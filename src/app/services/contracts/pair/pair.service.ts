import { Injectable } from '@angular/core';
import { ConnectionService } from '../../contract-connection/connection.service';
import BigNumber from 'bignumber.js';
import { LiquidityValue, PairData, TokenData } from 'src/app/interfaces/contracts';
import { UtilService } from '../utils/util.service';

const PairAbi = require('../abi/UniswapV2Pair.json');


@Injectable({
  providedIn: 'root'
})
export class PairService {

  constructor(private connService: ConnectionService,
    private utils: UtilService
  ) { }

  // Estimates how much the liquidityAmount is worth
  public async estimateLiquidityValue(pairAddr: string, tokena: TokenData, tokenb: TokenData, liquidityAmount: BigNumber)
    : Promise<LiquidityValue> {
    await this.connService.syncAccount();
    const pair = new this.connService.web3js.eth.Contract(PairAbi, pairAddr);
    // Get current reserves
    const pairData = await this.getPairData(pairAddr, tokena, tokenb);
    // Get the current liquidity supply
    const supply = await pair.methods.totalSupply().call({ from: this.connService.accounts[0] });
    // Finally estimate both amounts.
    const ownership = liquidityAmount.dividedBy(this.utils.fromWeiToBN(supply.toString()));
    const amount0 = pairData.reserve0.times(ownership);
    const amount1 = pairData.reserve1.times(ownership);
    // Keep the order of the pair
    if (this.utils.compareEthAddr(pairData.token0, tokena.addr)) {
      return { tokenA: tokena, amountA: amount0, tokenB: tokenb, amountB: amount1 };
    }
    else {
      return { tokenA: tokenb, amountA: amount0, tokenB: tokena, amountB: amount1 };
    }
  }

  // Returns reserves without decimals
  public async getReserves(pairAddr: string): Promise<string[]> {
    await this.connService.syncAccount();
    const pair = new this.connService.web3js.eth.Contract(PairAbi, pairAddr);
    const reserves = await pair.methods.getReserves().call({ from: this.connService.accounts[0] });
    return [reserves[0].toString(), reserves[1].toString()];
  }

  // Returns in order tokenA and tokenB
  public async getPairTokens(pairAddr: string): Promise<string[]> {
    try {
      await this.connService.syncAccount();
      const pair = new this.connService.web3js.eth.Contract(PairAbi, pairAddr);
      const tokena = (await pair.methods.token0().call({ from: this.connService.accounts[0] })).toString();
      const tokenb = (await pair.methods.token1().call({ from: this.connService.accounts[0] })).toString();
      return [tokena, tokenb];
    } catch (error) {
    }
  }

  // Returns the percentage of a pool that user owns in liquidity
  public async getOwnership(pairAddr: string): Promise<BigNumber> {
    await this.connService.syncAccount();
    const pair = new this.connService.web3js.eth.Contract(PairAbi, pairAddr);
    // Get the current liquidity supply
    const supply = await pair.methods.totalSupply().call({ from: this.connService.accounts[0] });
    // Get balance
    const balance = this.utils.fromWeiToBN(await pair.methods.balanceOf(this.connService.accounts[0])
      .call({ from: this.connService.accounts[0] }));
    // Finally estimate both amounts.
    return balance.dividedBy(this.utils.fromWeiToBN(supply));
  }

  public async getPairData(pairAddr: string, tokenA: TokenData, tokenB: TokenData): Promise<PairData> {
    await this.connService.syncAccount();
    // Validate if pair exists
    if (pairAddr === '0x0000000000000000000000000000000000000000') {
      return {
        reserve0: new BigNumber(0),
        reserve1: new BigNumber(0),
        token0: '0x0000000000000000000000000000000000000000',
        token1: '0x0000000000000000000000000000000000000000',
        addr: '0x0000000000000000000000000000000000000000',
        fee: 0
      };
    }
    const pair = new this.connService.web3js.eth.Contract(PairAbi, pairAddr);
    const tokens = await this.getPairTokens(pairAddr);
    const tokena = tokens[0];
    const tokenb = tokens[1];
    // Get fee if the pair has it
    let pairFee;
    try {
      pairFee = await pair.methods.fee().call({ from: this.connService.accounts[0] });
    }
    catch {
      pairFee = 3;
    }
    const reserves = await this.getReserves(pairAddr);
    let dec0 = tokenA.decimals;
    let dec1 = tokenB.decimals;
    // Check if token order is reversed
    if (!this.utils.compareEthAddr(tokena, tokenA.addr)) {
      dec0 = tokenB.decimals;
      dec1 = tokenA.decimals;
    }
    return {
      reserve0: this.utils.fromWeiToBN(reserves[0], dec0),
      reserve1: this.utils.fromWeiToBN(reserves[1], dec1),
      token0: tokena,
      token1: tokenb,
      addr: pairAddr,
      fee: Number(pairFee)
    };
  }
}
