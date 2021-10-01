import {Injectable} from '@angular/core';
import {ConnectionService} from '../../contract-connection/connection.service';
import {NetworkService} from 'src/app/services/contract-connection/network.service';
import BigNumber from 'bignumber.js';
import {LiquidityValue, TokenData} from 'src/app/interfaces/contracts';
import {UtilService} from '../utils/util.service';
const RouterAbi = require('../abi/UniswapV2Router02.json');


@Injectable({
  providedIn: 'root'
})

export class RouterService {

  addresses;

  constructor(
    private connService: ConnectionService,
    private utils: UtilService,
    private networkService: NetworkService
  ) {
    this.addresses = networkService.getAddressNetwork();
  }

  // Add liquidity to pool. If pool has ether set isETH=true, and one of the tokens should be the weth address
  public async addLiquidityAny(tokenA: TokenData, tokenB: TokenData, amountA: BigNumber, amountB: BigNumber, slippage: number,
                               deadline: number, isETH: boolean): Promise<any> {
    await this.connService.syncAccount();
    const router  = new this.connService.web3js.eth.Contract(RouterAbi, this.addresses.router_address);
    const minA = this.utils.fromBNtoWei((amountA.times((100 - slippage)).dividedBy(100)), tokenA.decimals);
    let minB =   this.utils.fromBNtoWei((amountB.times((100 - slippage)).dividedBy(100)), tokenB.decimals);
    const timestamp = (await this.connService.lastBlockTimestamp()) + deadline;

    if (isETH){
      // If isETH, one of the tokens is the weth address
      let tA = tokenA;
      let aA = amountA;
      let mA = minA;
      if (this.utils.compareEthAddr(tokenA.addr, this.addresses.weth_address)) {
        tA = tokenB;
        aA = amountB;
        mA = minB;
        amountB = amountA;
        minB = minA;
      }
      return await router.methods.addLiquidityETH(tA.addr, this.utils.fromBNtoWei(aA, tA.decimals),
        mA, minB, this.connService.accounts[0], timestamp)
        .send({from: this.connService.accounts[0], value: this.utils.fromBNtoWei(amountB)});
    }
    else{
      return await router.methods.addLiquidity(tokenA.addr, tokenB.addr, this.utils.fromBNtoWei(amountA, tokenA.decimals),
        this.utils.fromBNtoWei(amountB, tokenB.decimals), minA, minB, this.connService.accounts[0], timestamp)
        .send({from: this.connService.accounts[0]});
    }
 }

  // Given an output asset amount and an array of token addresses, calculates all preceding minimum input token amounts
  public async estimateAmountsIn(amountOut: BigNumber, tokenOut: TokenData, path: string[]): Promise<string[]> {
    await this.connService.syncAccount();
    const router  = new this.connService.web3js.eth.Contract(RouterAbi, this.addresses.router_address);
    try {
      return await router.methods.getAmountsIn(this.utils.fromBNtoWei(amountOut, tokenOut.decimals),
        path).call({from: this.connService.accounts[0]});
    }
    catch {
      throw Error('Not enough liquidity for amount');
    }
  }

  // Given an input asset amount and an array of token addresses, calculates all subsequent maximum output token amounts
  public async estimateAmountsOut(amountIn: BigNumber, tokenIn: TokenData, path: string[]): Promise<string[]> {
    await this.connService.syncAccount();
    const router  = new this.connService.web3js.eth.Contract(RouterAbi, this.addresses.router_address);
    try{
      return await router.methods.getAmountsOut(this.utils.fromBNtoWei(amountIn, tokenIn.decimals), path)
        .call({from: this.connService.accounts[0]});
    }
    catch {
      throw Error('Not enough liquidity for amount');
    }

  }

  // To get liquidityAddr, call getPair on FactoryService with both token's addresses
  public async removeLiquidityAny(liquidityAddr: string, liquidityAmount: BigNumber, slippage: number, deadline: number,
                                  liquidityValue: LiquidityValue, isETH: boolean): Promise<any> {
    await this.connService.syncAccount();
    const router  = new this.connService.web3js.eth.Contract(RouterAbi, this.addresses.router_address);
    const minA = this.utils.fromBNtoWei(liquidityValue.amountA.times((1000 - slippage)).dividedBy(1000), liquidityValue.tokenA.decimals);
    const minB = this.utils.fromBNtoWei(liquidityValue.amountB.times((1000 - slippage)).dividedBy(1000), liquidityValue.tokenB.decimals);
    const timestamp = (await this.connService.lastBlockTimestamp()) + deadline;
    // Check if pool has eth
    if (isETH) {
      let minETH = minB;
      let token = liquidityValue.tokenA.addr;
      let minToken = minA;
      if (this.utils.compareEthAddr(liquidityValue.tokenA.addr, this.addresses.weth_address)) {
        token = liquidityValue.tokenB.addr;
        minETH = minA;
        minToken = minB;
      }
      return await router.methods.removeLiquidityETH(token,
        this.utils.fromBNtoWei(liquidityAmount), minToken, minETH,
        this.connService.accounts[0], timestamp).send({from: this.connService.accounts[0]});
    }
    else{
      return await router.methods.removeLiquidity(liquidityValue.tokenA.addr, liquidityValue.tokenB.addr,
        this.utils.fromBNtoWei(liquidityAmount), minA, minB,
        this.connService.accounts[0], timestamp).send({from: this.connService.accounts[0]});
    }
  }

  // *A > B or *A > ETH or *ETH > A
  public async swapAnyForExactAny(amountInMax: BigNumber, amountOutExact: BigNumber, tokenIn: TokenData, tokenOut: TokenData,
                                  slippage, deadline: number, isETH: boolean, to: string = '0x'): Promise<any> {
    if (to === '0x') {
      to = this.connService.accounts[0];
    }
    await this.connService.syncAccount();
    const inmax = amountInMax.times((1000 + slippage)).dividedBy(1000);
    const router  = new this.connService.web3js.eth.Contract(RouterAbi, this.addresses.router_address);
    const timestamp = (await this.connService.lastBlockTimestamp()) + deadline;
    if (isETH){
      // If A is ETH
      if (this.utils.compareEthAddr(tokenIn.addr, this.addresses.weth_address)){
        return await router.methods.swapETHForExactTokens(this.utils.fromBNtoWei(amountOutExact, tokenOut.decimals),
          [tokenIn.addr, tokenOut.addr], to, timestamp)
          .send({from: this.connService.accounts[0] , value: this.utils.fromBNtoWei(inmax)});
      }
      else if (this.utils.compareEthAddr(tokenOut.addr, this.addresses.weth_address)){
        // If B is ETH
        return await router.methods.swapTokensForExactETH(this.utils.fromBNtoWei(amountOutExact, tokenOut.decimals),
          this.utils.fromBNtoWei(inmax, tokenIn.decimals), [tokenIn.addr, tokenOut.addr], to, timestamp)
          .send({from: this.connService.accounts[0]});
      }
      else {
        throw Error('No weth address in path');
      }
    }
    else{
      return await router.methods.swapTokensForExactTokens(this.utils.fromBNtoWei(amountOutExact, tokenOut.decimals),
        this.utils.fromBNtoWei(inmax, tokenIn.decimals), [tokenIn.addr, tokenOut.addr], to, timestamp)
        .send({from: this.connService.accounts[0]});
    }
  }

  // A > *B or A > *ETH or ETH > *A
  public async swapExactAnyForAny(amountInExact: BigNumber, amountOutMin: BigNumber, tokenIn: TokenData, tokenOut: TokenData,
                                  slippage: number, deadline: number, isETH: boolean, to: string = '0x'): Promise<any> {
    if (to === '0x') {
      to = this.connService.accounts[0];
    }
    await this.connService.syncAccount();
    const router  = new this.connService.web3js.eth.Contract(RouterAbi, this.addresses.router_address);
    const outmin = amountOutMin.times((1000 - slippage)).dividedBy(1000);
    const timestamp = (await this.connService.lastBlockTimestamp()) + deadline;
    if (isETH){
      // If A is ETH
      if (this.utils.compareEthAddr(tokenIn.addr, this.addresses.weth_address)){
        return await router.methods.swapExactETHForTokens(this.utils.fromBNtoWei(outmin, tokenOut.decimals),
          [tokenIn.addr, tokenOut.addr], to, timestamp)
          .send({from: this.connService.accounts[0] , value: this.utils.fromBNtoWei(amountInExact)});
      }
      else if (this.utils.compareEthAddr(tokenOut.addr, this.addresses.weth_address)) {
       // If B is ETH
        return await router.methods.swapExactTokensForETH(this.utils.fromBNtoWei(amountInExact, tokenIn.decimals),
          this.utils.fromBNtoWei(outmin), [tokenIn.addr, tokenOut.addr], to, timestamp)
          .send({from: this.connService.accounts[0]});
      }
      else {
        throw Error('No weth address in path');
      }
    }
    else {
      return await router.methods.swapExactTokensForTokens(this.utils.fromBNtoWei(amountInExact, tokenIn.decimals),
        this.utils.fromBNtoWei(outmin, tokenOut.decimals), [tokenIn.addr, tokenOut.addr], to, timestamp)
        .send({from: this.connService.accounts[0]});
    }
  }
}
