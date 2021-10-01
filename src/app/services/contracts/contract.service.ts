import { Injectable } from '@angular/core';
import { TokenService } from './token/token.service';
import BigNumber from 'bignumber.js';
import { ConnectionService } from '../contract-connection/connection.service';
import { FactoryService } from './factory/factory.service';
import { router_address, weth_address, bambooToken_address } from '../contract-connection/tools/addresses';
import { FieldUserInfo, PairData, TokenData } from '../../interfaces/contracts';
import { PairService } from './pair/pair.service';
import { UtilService } from './utils/util.service';
import { KeeperService } from './keeper/keeper.service';
import { FieldService } from './field/field.service';
import { OwnWallet } from 'src/app/interfaces/own-wallet';
import { ServiceService } from 'src/app/services/service.service';
import { Pool } from 'src/app/interfaces/pool';
import { PairTransaction } from '../../interfaces/pair-transaction';
import { Bamboo } from 'src/app/interfaces/bamboo';
import { Pair } from 'src/app/interfaces/pair';
import * as TokenConstants from '../../constants/token.constants';
import { NetworkService } from '../contract-connection/network.service';

const SHOW_DECIMALS = 4;
const SHORT_DECIMALS = 2;
const BLOCKS_PER_MIN = 4;
const USDT_ROI = 1000;
const DAYS_MONTH = 30;
const DAYS_YEAR = 365;
const MINS_DAY = 1440;

@Injectable({
  providedIn: 'root',
})

// Combinations of some service calls
export class ContractService {

  addresses: any;

  constructor(private tokenService: TokenService,
              private connService: ConnectionService,
              private factoryService: FactoryService,
              private pairService: PairService,
              private utils: UtilService,
              private keeperService: KeeperService,
              private fieldService: FieldService,
              private service: ServiceService,
              private networkService: NetworkService
  ) {
    this.addresses = this.networkService.getAddressNetwork();
  }

  // Get pairData from two token addresses. Warning: the token order may be changed
  async getPairInfo(tokenA: TokenData, tokenB: TokenData): Promise<PairData> {
    const pairaddr = await this.factoryService.getPair(tokenA.addr, tokenB.addr);
    return await this.pairService.getPairData(pairaddr, tokenA, tokenB);
  }

  // Get pairData from pairID
  async getPairDBInfo(address: string): Promise<Pair> {
    return new Promise(resolve => {
      this.service.getPairDataDB(address).subscribe(
        res => {
          console.log('res', res);
          let logoTokenFirst = res.pair.logoTokenFirst;
          let pairTokenNameFirst = res.pair.pairTokenNameFirst;
          let addressTokenFirst = res.pair.addressTokenFirst;
          let pairFirstEqualSecond = res.pair.pairFirstEqualSecond;
          let ammountFirst = res.pair.ammountFirst;
          let logoTokenSecond = res.pair.logoTokenSecond;
          let pairTokenNameSecond = res.pair.pairTokenNameSecond;
          let addressTokenSecond = res.pair.addressTokenSecond;
          let pairSecondEqualFirst = res.pair.pairSecondEqualFirst;
          let ammountSecond = res.pair.ammountSecond;
          if (res.pair.pairTokenNameSecond.toLowerCase() === TokenConstants.BAMBOO.toLowerCase()) {
            logoTokenFirst = res.pair.logoTokenSecond;
            pairTokenNameFirst = res.pair.pairTokenNameSecond;
            addressTokenFirst = res.pair.addressTokenSecond;
            pairFirstEqualSecond = res.pair.pairSecondEqualFirst;
            ammountFirst = res.pair.ammountSecond;
            logoTokenSecond = res.pair.logoTokenFirst;
            pairTokenNameSecond = res.pair.pairTokenNameFirst;
            addressTokenSecond = res.pair.addressTokenFirst;
            pairSecondEqualFirst = res.pair.pairFirstEqualSecond;
            ammountSecond = res.pair.ammountFirst;
          }
          resolve({
            id: res.pair.id,
            logoTokenFirst,
            logoTokenSecond,
            pairTokenNameFirst,
            pairTokenNameSecond,
            addressTokenFirst,
            addressTokenSecond,
            pairAddress: res.pair.address,
            liquidity: res.pair.liquidity,
            liquidityPercentaje: res.pair.liquidityPercentage,
            volume24: res.pair.volume24,
            volume24Percentaje: res.pair.volume24Percentage,
            volume7: res.pair.volume7,
            volume7Percentaje: res.pair.volume7Percentage,
            fees24: res.pair.fees24,
            fees24Percentaje: res.pair.fees24Percentage,
            feesYear: res.pair.feesYear,
            feesYearPercentaje: res.pair.feesYearPercentage,
            pairFirstEqualSecond,
            pairSecondEqualFirst,
            ammountFirst,
            ammountSecond
          });
        }
      );
    });
  }

  // Get pairData from pairID
  async getPairDBInfoID(id: string): Promise<PairData> {
    return new Promise(resolve => {
      this.service.getPairDataDBID(id).subscribe(
        res => {
          resolve({
            reserve0: res.pair.amountFirst,
            reserve1: res.pair.amountSecond,
            token0: res.pair.addressTokenFirst,
            token1: res.pair.addressTokenSecond,
            addr: res.pair.pairAddress,
            fee: res.pair.fee
          });
        }
      );
    });
  }

  // Get pairData from two token addresses from DB
  async getPairDBInfoAddresses(token1: string, token2: string): Promise<PairData> {
    return new Promise(resolve => {
      this.service.getPairDataDBAddresses(token1, token2).subscribe(
        res => {
          console.log('res en servcice BD', res);
          resolve({
            reserve0: token1.toLowerCase() === res.pair.addressTokenFirst.toLowerCase() ?
              new BigNumber(res.pair.amountFirst ? res.pair.amountFirst : res.pair.ammountFirst) :
              new BigNumber(res.pair.amountSecond ? res.pair.amountSecond : res.pair.ammountSecond),
            reserve1: token2.toLowerCase() === res.pair.addressTokenSecond.toLowerCase() ?
              new BigNumber(res.pair.amountSecond ? res.pair.amountSecond : res.pair.ammountSecond) :
              new BigNumber(res.pair.amountFirst ? res.pair.amountFirst : res.pair.ammountFirst),
            token0: token1,
            token1: token2,
            addr: res.pair.pairAddress,
            fee: res.pair.fee
          });
        },
        err => {
          resolve({
            addr: 'null',
            reserve0: null,
            reserve1: null,
            token0: token1,
            token1: token2,
            fee: null
          });
         }
      );

    });
  }

  // Get pairData given only the pair address.
  async getPairDataFromAddr(pairAddr: string): Promise<PairData> {
    try {
      const tokens = await this.pairService.getPairTokens(pairAddr);
      const tokenA = await this.tokenService.getTokenData(tokens[0]);
      const tokenB = await this.tokenService.getTokenData(tokens[1]);
      return await this.pairService.getPairData(pairAddr, tokenA, tokenB);
    } catch (error) {
    }
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

  // Is allowed or need validate
  async hasAllowance(token: TokenData, spender: string, amount: BigNumber): Promise<boolean> {
    const allowance1 = this.utils.fromWeiToBN(
      await this.tokenService.getAllowance(token.addr, spender), token.decimals);
    console.log('allowance', allowance1);
    if (allowance1.isLessThanOrEqualTo(amount)) {
      const receipt = false;
      // Exact amout or a bignumber to save gas
      return receipt;
    } else {
      const receipt = true;
      // Exact amout or a bignumber to save gas
      return receipt;

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
              id: pool.id,
              logo: pool.logo,
              logoTokenFirst: pool.logoTokenFirst,
              logoTokenSecond: pool.logoTokenSecond,
              title: pool.logoTitle,
              pair: pool.pair,
              address: pool.address,
              addressTokenFirst: pool.addressTokenFirst,
              addressTokenSecond: pool.addressTokenSecond,
              underlyingToken: 0.0,
              underlyingTokenFirst: pool.underlyingTokenFirst,
              underlyingTokenSecond: pool.underlyingTokenSecond,
              underlyingTokenFirstValue: pool.underlyingTokenFirstValue,
              underlyingTokenSecondValue: pool.underlyingTokenSecondValue,
              underlyingTokenFirstValueUSDT: pool.underlyingTokenFirstValueUSDT,
              underlyingTokenSecondValueUSDT: pool.underlyingTokenSecondValueUSDT,
              underlyingBamboo: 0.0,
              value: 0.0,
              yield: pool.yield,
              yieldReward: pool.yieldReward,
              roiDaily: pool.roiDaily,
              roiMonthly: pool.roiMonthly,
              roiYearly: pool.roiYearly,
              tvl: pool.tvl,
              available: 0,
              staked: 0,
              reward: 0,
              isActive: false,
              isLoading: true,
              bambooPrice: pool.bambooPrice,
              isExcludedFromBambooPrice: pool.isExcludedFromBambooPrice,
              roiYCompound: pool.roiYCompound
            };
            if (poolA.yieldReward === 0) {
              poolA.yieldReward = 1.0;
            }
            if (poolA.underlyingTokenSecond.toLowerCase() === TokenConstants.BAMBOO.toLowerCase()) {
              const auxToken = poolA.underlyingTokenFirst;
              poolA.underlyingTokenFirst = poolA.underlyingTokenSecond;
              poolA.underlyingTokenSecond = auxToken;
              const auxAddress = poolA.addressTokenFirst;
              poolA.addressTokenFirst = poolA.addressTokenSecond;
              poolA.addressTokenSecond = auxAddress;
              const auxTokenValue = poolA.underlyingTokenFirstValue;
              poolA.underlyingTokenFirstValue = poolA.underlyingTokenSecondValue;
              poolA.underlyingTokenSecondValue = auxTokenValue;
              const auxTokenUSDT = poolA.underlyingTokenFirstValueUSDT;
              poolA.underlyingTokenFirstValueUSDT = poolA.underlyingTokenSecondValueUSDT;
              poolA.underlyingTokenSecondValueUSDT = auxTokenUSDT;
              const auxLogo = poolA.logoTokenFirst;
              poolA.logoTokenFirst = poolA.logoTokenSecond;
              poolA.logoTokenSecond = auxLogo;
            }
            poolList.push(poolA);
          }
          // this.getTVLForPools(poolList);
          // this.getROIPerBlock(poolList);
          resolve(poolList);
        });
    });
  }

  async getWeb3PoolList(pools: Pool[]): Promise<Pool[]> {
    return new Promise((resolve => {

      pools.forEach(pool => this.getWeb3Pool(pool));

      // for (const pool of pools) {
      //   this.getWeb3Pool(pool);
      // }
    }));
  }

  async getWeb3Pool(pool: Pool): Promise<Pool> {

    return new Promise((async resolve => {
      const poolData = await this.getPairDataFromAddr(pool.address);
      // Get balance data
      const tokenData = await this.tokenService.getTokenData(pool.address);
      // Staked, earnings
      //const stakedLP = Number((await this.keeperService.getStakedLP(pool.id, tokenData)).toFixed(SHOW_DECIMALS));
      const stakedLP = Number((await this.keeperService.getStakedLP(pool.id, tokenData)).toFixed(18));
      const pendingBB = Number((await this.keeperService.getPendingBAMBOO(pool.id)).toFixed(SHOW_DECIMALS));
      if (poolData.token1.toLowerCase() === bambooToken_address.toLowerCase()) {
        pool.underlyingTokenFirstValue = Number(poolData.reserve1.toFixed(SHOW_DECIMALS));
        pool.underlyingTokenSecondValue = Number(poolData.reserve0.toFixed(SHOW_DECIMALS));
      } else {
        pool.underlyingTokenFirstValue = Number(poolData.reserve0.toFixed(SHOW_DECIMALS));
        pool.underlyingTokenSecondValue = Number(poolData.reserve1.toFixed(SHOW_DECIMALS));
      }
      pool.available = Number(tokenData.balance.toFixed(SHOW_DECIMALS));
      pool.staked = stakedLP;
      pool.reward = pendingBB;
      const allowance1 = this.utils.fromWeiToBN(
        await this.tokenService.getAllowance(pool.address, this.addresses.zooKeeper_address), 18);
      pool.isActive = stakedLP > 0 || allowance1.isGreaterThan(0);
      pool.isLoading = false;
    }));
  }

  /**
   * Method for calculating ROI per block
   */
  getROIPerBlock(pools: Pool[]): void {
    pools.forEach(pool => {
      // TODO: Change to bamboo price from our market
      this.service.getTokenPriceInUSDT(TokenConstants.ID_BAMBOO).subscribe(res => {
        const bambooDayUSDT = pool.yield * BLOCKS_PER_MIN * MINS_DAY * res[0].current_price;
        pool.roiDaily = Number((bambooDayUSDT / USDT_ROI).toFixed(SHORT_DECIMALS));
        pool.roiMonthly = Number(((bambooDayUSDT * DAYS_MONTH) / USDT_ROI).toFixed(SHORT_DECIMALS));
        pool.roiYearly = Number(((bambooDayUSDT * DAYS_YEAR) / USDT_ROI).toFixed(SHORT_DECIMALS));
      });
    });
  }

  /**
   * Method for calculating TVL by pool
   */
  getTVLForPools(pools: Pool[]): void {
    pools.forEach(pool => {
      const idToken1 = this.utils.getIdTokenForCoinGeckoAPI(pool.underlyingTokenFirst);
      const idToken2 = this.utils.getIdTokenForCoinGeckoAPI(pool.underlyingTokenSecond);
      this.service.getTokenPriceInUSDT(idToken1).subscribe(res => {
        const firstValueInUSDT = pool.underlyingTokenFirstValue * res[0].current_price;
        this.service.getTokenPriceInUSDT(idToken2).subscribe(result => {
          const secondValueInUSDT = pool.underlyingTokenSecondValue * result[0].current_price;
          pool.tvl = Number((firstValueInUSDT + secondValueInUSDT).toFixed(SHORT_DECIMALS));
        });
      });
    });
  }

  /**
   * Method for calculate Bamboo Market (Summary)
   */
  async getBambooSummary(): Promise<Bamboo> {
    const bamboo: Bamboo = {
      valor: 0,
      porcentaje: 0,
      liquidity: 0,
      porcentajeLiquidity: 0,
      fees: 0
    };
    let totalBamboo = 0;
    const bambooPrices: number[] = [];
    let tok1Value = 0;
    let tok2Value = 0;
    return new Promise((resolve) => {
      this.service.getPoolList().subscribe(
        async (res) => {
          const pools = res.pools;
          for (const key of Object.keys(pools)) {
            const pool = pools[key];
            const poolData = await this.getPairDataFromAddr(pool.Address);
            const idToken1 = this.utils.getIdTokenForCoinGeckoAPI(pool.UnderlyingTokenFirst);
            const idToken2 = this.utils.getIdTokenForCoinGeckoAPI(pool.UnderlyingTokenSecond);
            if (pool.UnderlyingTokenFirst !== 'BAMBOO') {
              tok1Value = await this.getTokenPrice(idToken1, poolData.reserve1);
            } else {
              totalBamboo += Number(poolData.reserve1);
            }
            if (pool.UnderlyingTokenSecond !== 'BAMBOO') {
              tok2Value = await this.getTokenPrice(idToken2, poolData.reserve0);
            } else {
              totalBamboo += Number(poolData.reserve0);
            }
            if (tok1Value === 0) {
              bambooPrices.push(tok2Value / Number(poolData.reserve1));
              bamboo.liquidity += tok2Value * 2;
            } else if (tok2Value === 0) {
              bambooPrices.push(tok1Value / Number(poolData.reserve0));
              bamboo.liquidity += tok1Value * 2;
            } else {
              bamboo.liquidity += tok1Value + tok2Value;
            }
          }
          let sum = 0;
          for (const price of bambooPrices) {
            sum += price;
          }
          bamboo.valor = sum / bambooPrices.length;
          resolve(bamboo);
        });
    });
  }

  // Get pool list. If detailed is true, will fill out onChain data.
  async getPairList(detailed: boolean = true): Promise<Pair[]> {
    // Get token list from service
    const pairList: Pair[] = [];
    return new Promise((resolve) => {
      this.service.getPoolList().subscribe(
        async (res) => {
          const pools = res.pools;
          for (const key of Object.keys(pools)) {
            const pool = pools[key];
            const pair: Pair = {
              id: pool.Id,
              logoTokenFirst: pool.LogoTokenFirst,
              logoTokenSecond: pool.LogoTokenSecond,
              pairTokenNameFirst: pool.UnderlyingTokenFirst,
              pairTokenNameSecond: pool.UnderlyingTokenSecond,
              addressTokenFirst: pool.AddressTokenFirst,
              addressTokenSecond: pool.AddressTokenSecond,
              pairAddress: pool.Address,
              liquidity: 0,
              liquidityPercentaje: 0,
              volume24: 0,
              volume24Percentaje: 0,
              volume7: 0,
              volume7Percentaje: 0,
              fees24: 0,
              fees24Percentaje: 0,
              feesYear: 0,
              feesYearPercentaje: 0,
              pairFirstEqualSecond: 0,
              pairSecondEqualFirst: 0,
              ammountFirst: 0,
              ammountSecond: 0
            };
            if (detailed && this.connService.provider !== undefined) {
              const poolData = await this.getPairDataFromAddr(pair.pairAddress);
              pair.ammountFirst = Number(poolData.reserve0.toFixed(SHOW_DECIMALS));
              pair.ammountSecond = Number(poolData.reserve1.toFixed(SHOW_DECIMALS));
            }
            pairList.push(pair);
          }
          this.getLiquidityPairs(pairList);
          resolve(pairList);
        });
    });
  }

  /**
   * Method for calculating liquidity per pair
   */
  getLiquidityPairs(pairs: Pair[]): void {
    pairs.forEach(pair => {
      const idToken1 = this.utils.getIdTokenForCoinGeckoAPI(pair.pairTokenNameFirst);
      const idToken2 = this.utils.getIdTokenForCoinGeckoAPI(pair.pairTokenNameFirst);
      this.service.getTokenPriceInUSDT(idToken1).subscribe(res => {
        const firstValueInUSDT = pair.ammountSecond * res[0].current_price;
        this.service.getTokenPriceInUSDT(idToken2).subscribe(result => {
          const secondValueInUSDT = pair.ammountFirst * result[0].current_price;
          pair.liquidity = Number((firstValueInUSDT + secondValueInUSDT).toFixed(SHORT_DECIMALS));
        });
      });
    });
  }

  /**
   * Get Token USDT Price
   */
  async getTokenPrice(tokenID, tokenAmount): Promise<number> {
    return new Promise(async (resolve) => {
      await this.service.getTokenPriceInUSDT(tokenID).subscribe(res => {
        const secondValueInUSDT = Number(tokenAmount) * res[0].current_price;
        resolve(Number((secondValueInUSDT).toFixed(SHORT_DECIMALS)));
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

  async getPairTxDBList(pairId: string): Promise<PairTransaction[]> {
    return new Promise(async (resolve) => {
      this.service.getTxDBData(pairId).subscribe(
        async (res) => {
          for (const tx of res.txList) {
            tx.tokenAmmount1 = tx.tokenAmount1;
            tx.tokenAmmount2 = tx.tokenAmount2;
          }
          resolve(res.txList);
        }
      );
    });
  }

  async getPairTxAddressDBList(address: string): Promise<PairTransaction[]> {
    return new Promise(async (resolve) => {
      this.service.getTxAddressDBData(address).subscribe(
        async (res) => {
          for (const tx of res.txList) {
            tx.tokenAmmount1 = tx.tokenAmount1;
            tx.tokenAmmount2 = tx.tokenAmount2;
          }
          resolve(res.txList);
        }
      );
    });
  }

  isConnection(): boolean {
    if (this.connService.provider === undefined) {
      return false;
    } else {
      return true;
    }
  }
}
