import {Injectable} from '@angular/core';
import {TokenService} from './token/token.service';
import BigNumber from 'bignumber.js';
import {RouterService} from './router/router.service';
import {ConnectionService} from '../contract-connection/connection.service';
import {FactoryService} from './factory/factory.service';
import {weth_address, router_address, usdt_address} from '../contract-connection/tools/addresses';
import {FieldUserInfo, PairData, TokenData} from '../../interfaces/contracts';
import {PairService} from './pair/pair.service';
import {UtilService} from './utils/util.service';
import {KeeperService} from './keeper/keeper.service';
import {RaindropService} from './raindrop/raindrop.service';
import {BbypService} from './bbyp/bbyp.service';
import {FieldService} from './field/field.service';
import {OwnWallet} from 'src/app/interfaces/own-wallet';
import {ServiceService} from 'src/app/services/service.service';
import {Pool} from 'src/app/interfaces/pool';
import {PairTransaction} from '../../interfaces/pair-transaction';

const SHOW_DECIMALS = 4;

@Injectable({
  providedIn: 'root',
})

// Combinations of some service calls
export class ContractService {

  constructor(private tokenService: TokenService,
              private routerService: RouterService,
              private connService: ConnectionService,
              private factoryService: FactoryService,
              private pairService: PairService,
              private utils: UtilService,
              private keeperService: KeeperService,
              private raindropService: RaindropService,
              private bbypService: BbypService,
              private fieldService: FieldService,
              private service: ServiceService
  ) {
  }

  // Get pairData from two token addresses. Warning: the token order may be changed
  async getPairInfo(tokenA: TokenData, tokenB: TokenData): Promise<PairData> {
    const pairaddr = await this.factoryService.getPair(tokenA.addr, tokenB.addr);
    return await this.pairService.getPairData(pairaddr, tokenA, tokenB);
  }

  // Get pairData given only the pair address.
  async getPairDataFromAddr(pairAddr: string): Promise<PairData> {
    const tokens = await this.pairService.getPairTokens(pairAddr);
    const tokenA = await this.tokenService.getTokenData(tokens[0]);
    const tokenB = await this.tokenService.getTokenData(tokens[1]);
    return await this.pairService.getPairData(pairAddr, tokenA, tokenB);
  }

  // Validate allowance is greater or equal to amount
  async validateAllowance(token: TokenData, spender: string, amount: BigNumber): Promise<void> {
    const allowance1 = this.utils.fromWeiToBN(
      await this.tokenService.getAllowance(token.addr, spender), token.decimals);
    if (allowance1.isLessThanOrEqualTo(amount)) {
      // Exact amout or a bignumber to save gas
      await this.tokenService.approve(token, spender);
    }
  }

  // Validate balance is greater or equal to amount
  async validateBalance(tokenA: TokenData, tokenB: TokenData, amountA: BigNumber, amountB: BigNumber, isETH: boolean): Promise<void> {
    // Validation of Balances (maybe do this elsewhere?)
    if (isETH) {
      let tokenBalance = tokenA.balance;
      let amount0 = amountA;
      let amountETH = amountB;
      const balanceEth = await this.connService.getETHBalance();
      if (this.utils.compareEthAddr(tokenA.addr, weth_address)) {
        amountETH = amountA;
        amount0 = amountB;
        tokenBalance = tokenB.balance;
      }
      if (amount0 > tokenBalance || amountETH > this.utils.fromWeiToBN(balanceEth)) {
        throw Error('Invalid balance');
      }
    } else {
      if (amountA.isGreaterThan(tokenA.balance) || amountB.isGreaterThan(tokenB.balance)) {
        throw Error('Invalid balance');
      }
    }
  }

  // Validate address
  async validateAddress(addr: string): Promise<boolean> {
    return await this.connService.validateAddress(addr);
  }

  // Estimate Seed gains
  async estimateSeedValue(): Promise<BigNumber> {
    const balance = await this.tokenService.getSeedBambooBalance();
    return await this.fieldService.estimateSeedValue(balance);
  }

  async getCurrentBlockTimestamp(): Promise<number> {
    return await this.connService.lastBlockTimestamp();
  }

  // Get own wallet data
  async getOwnWallet(): Promise<OwnWallet> {
    if (this.connService.provider === undefined) {
      return {
        unstaked: 0,
        staked: 0,
        toHarvest: 0,
        bambooField: 0,
        totalBamboo: 0,
      };
    }
    const bambooData = await this.tokenService.getBAMBOOData();
    const seedData = await this.tokenService.getSeedData();
    const uInfo: FieldUserInfo = await this.fieldService.getUserInfo();
    const stake = await this.keeperService.getTotalStakedAmount();
    let seedValue = await this.estimateSeedValue();
    if (seedValue.isNaN()) {
      seedValue = new BigNumber(1);
    }
    let toHarvest = seedData.balance.multipliedBy(seedValue);
    if (toHarvest.isNaN()) {
      toHarvest = new BigNumber(0);
    }
    const total = bambooData.balance.plus(stake).plus(toHarvest).plus(uInfo.amount);
    return {
      unstaked: Number(bambooData.balance.toFixed(SHOW_DECIMALS)),
      staked: Number(stake.toFixed(SHOW_DECIMALS)),
      toHarvest: Number(toHarvest.toFixed(SHOW_DECIMALS)),
      bambooField: Number(uInfo.amount.toFixed(SHOW_DECIMALS)),
      totalBamboo: Number(total.toFixed(SHOW_DECIMALS)),
    };
  }

  // Get pool list. If detailed is true, will fill out onChain data.
  async getPoolList(detailed: boolean = true): Promise<Pool[]> {
    // Get token list from service
    const poolList: Pool[] = [];
    return new Promise((resolve) => {
      this.service.getPoolList().subscribe(
        async (res) => {
          const pools = res.pools;
          for (const key of Object.keys(pools)) {
            const pool = pools[key];
            const poolA: Pool = {
              id: pool.Id,
              logo: pool.Logo,
              logoTokenFirst: pool.LogoTokenFirst,
              logoTokenSecond: pool.LogoTokenSecond,
              title: pool.LogoTitle,
              pair: pool.Pair,
              address: pool.Address,
              addressTokenFirst: pool.AddressTokenFirst,
              addressTokenSecond: pool.AddressTokenSecond,
              underlyingToken: 0.0,
              underlyingTokenFirst: pool.UnderlyingTokenFirst,
              underlyingTokenSecond: pool.UnderlyingTokenSecond,
              underlyingTokenFirstValue: 0,
              underlyingTokenSecondValue: 0,
              underlyingBamboo: 0.0,
              value: 0.0,
              yield: pool.Yield,
              yieldReward: 0.0,
              roiDaily: 0.0,
              roiMonthly: 0.0,
              roiYearly: 0.0,
              tvl: 0.0,
              available: 0,
              staked: 0,
              reward: 0,
              isActive: false
            };
            if (detailed && this.connService.provider !== undefined) {
              const poolData = await this.getPairDataFromAddr(pool.Address);
              // Get balance data
              const tokenData = await this.tokenService.getTokenData(pool.Address);
              // Staked, earnings
              const stakedLP = Number((await this.keeperService.getStakedLP(pool.Id, tokenData)).toFixed(SHOW_DECIMALS));
              const pendingBB = Number((await this.keeperService.getPendingBAMBOO(pool.Id)).toFixed(SHOW_DECIMALS));
              poolA.underlyingTokenFirstValue = Number(poolData.reserve0.toFixed(SHOW_DECIMALS));
              poolA.underlyingTokenSecondValue = Number(poolData.reserve1.toFixed(SHOW_DECIMALS));
              poolA.available = Number(tokenData.balance.toFixed(SHOW_DECIMALS));
              poolA.staked = stakedLP;
              poolA.reward = pendingBB;
              poolA.isActive = stakedLP > 0;
            }
            poolList.push(poolA);
          }
          resolve(poolList);
        });
    });
  }

  // Get transaction list of pair and filters them.
  async getPairTxList(address: string): Promise<PairTransaction[]> {
    // Get block number
    const lastBlock = await this.connService.lastBlockNumber();
    const pairData = await this.getPairDataFromAddr(address);
    const tokenData0 = await this.tokenService.getDetailedTokenData(pairData.token0);
    const tokenData1 = await this.tokenService.getDetailedTokenData(pairData.token1);

    // Get pairData from address

    const txList: PairTransaction[] = [];
    return new Promise((resolve) => {
      // TODO: hardcode the deploy block in mainnet
      // WARNING: this transaction list does not scale well. Consider adjusting blocklength, or index a database
      // on a different service for more efficient times.
      this.service.getTransactionList(router_address, '0', lastBlock.toString()).subscribe(
        async (res) => {
          const transactions = res.result;
          for (const key of Object.keys(transactions)) {
            const transaction = transactions[key];
            const tx = this.utils.filterPairTx(pairData, tokenData0, tokenData1, transaction);
            // Returns undefined if the tx does not match the filters
            if (tx !== undefined) {
              txList.push(tx);
            }
          }
          resolve(txList);
        });
    });
  }

  // Gets the bamboo value in USDT
  async getBambooValueInUSDT(): Promise<number> {
    const pools = await this.getPoolList();
    const value = pools.filter(p => p.addressTokenSecond.toLowerCase() === usdt_address.toLowerCase());
    return value[0].value;
  }

  // Gets the bamboo liquidity in USDT
  async getLiquidityInUSDT(): Promise<number> {
    const pools = await this.getPoolList();
    let liquidity = 0;
    pools.forEach(pool => {
      liquidity += pool.value;
    });
    return liquidity;
  }

  isConnection(): boolean {
    if (this.connService.provider === undefined) {
      return false;
    } else {
      return true;
    }
  }
}
