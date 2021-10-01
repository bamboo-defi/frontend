import {Injectable} from '@angular/core';
import {Volumes} from 'src/app/interfaces/volumes';
import {ContractService} from '../../contracts/contract.service';
import {Bamboo} from '../../../interfaces/bamboo';
import {UtilService} from '../../contracts/utils/util.service';
import {ServiceService} from '../../service.service';
import {PairTransaction} from '../../../interfaces/pair-transaction';

const MILLISECS_DAY = 86400000;
const MILLISECS_WEEK = MILLISECS_DAY * 7;

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(
    private contractService: ContractService,
    private utils: UtilService,
    private service: ServiceService
  ) {
  }

  async getVolumes(pairAddresses: string[]): Promise<Volumes[]> {
    const fechaAyer = (new Date().getTime() - MILLISECS_DAY) / 1000;
    const fechaSemana = (new Date().getTime() - MILLISECS_WEEK) / 1000;
    const volumes: Volumes[] = [];
    return new Promise(async (resolve) => {
      for (const pairAddress of pairAddresses) {
        const pairTransaction = await this.contractService.getPairTxList(pairAddress);
        const pairVolume: Volumes = {id: pairAddress, volume24h: 0, volume7days: 0, volumeTotal: 0};
        for (const pair of pairTransaction) {
          if (Number(pair.timeStamp) >= fechaAyer && pair.type === 'SWAP') {
            pairVolume.volume24h += await this.calcVolumeUSDT(pair);
          }
          if (Number(pair.timeStamp) >= fechaSemana && pair.type === 'SWAP') {
            pairVolume.volume7days += await this.calcVolumeUSDT(pair);
          }
          if (pair.type === 'SWAP') {
            pairVolume.volumeTotal += await this.calcVolumeUSDT(pair);
          }
        }
        volumes.push(pairVolume);
      }
      resolve(volumes);
    });
  }

  async calcVolumeUSDT(pair: PairTransaction): Promise<number> {
    const idToken1 = this.utils.getIdTokenForCoinGeckoAPI(pair.tokenName1);
    const idToken2 = this.utils.getIdTokenForCoinGeckoAPI(pair.tokenName2);
    let usdt: number;
    if (pair.tokenName1 === 'BAMBOO') {
      usdt = await this.getTokenPrice(idToken1, pair.tokenAmmount1);
    } else if (pair.tokenName2 === 'BAMBOO') {
      usdt = await this.getTokenPrice(idToken2, pair.tokenAmmount2);
    } else {
      usdt = await this.getTokenPrice(idToken2, pair.tokenAmmount2);
    }
    return usdt;
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

          const data: string[] = [];
          for (const key of Object.keys(pools)) {
            const pool = pools[key];
            data.push(pool.Address);
            const poolData = await this.contractService.getPairDataFromAddr(pool.Address);
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
          const volumes = await this.getVolumes(data);
          sum = 0;
          for (const vol of volumes) {
            sum += vol.volume24h;
          }
          bamboo.fees = sum * 0.003;
          resolve(bamboo);
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
        resolve(Number((secondValueInUSDT).toFixed(2)));
      });
    });
  }
}
