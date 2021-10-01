import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Bamboo} from 'src/app/interfaces/bamboo';
import {LiquidityMinus} from 'src/app/interfaces/liquidity-minus';
import {Pool} from 'src/app/interfaces/pool';
import {ServiceService} from 'src/app/services/service.service';
import {SelectToken} from '../to-trade/to-trade.component';
import {environment} from 'src/environments/environment';
import {TokenService} from 'src/app/services/contracts/token/token.service';
import {RouterService} from 'src/app/services/contracts/router/router.service';
import {UtilService} from 'src/app/services/contracts/utils/util.service';
import {LiquidityValue, PairData, TokenData} from 'src/app/interfaces/contracts';
import BigNumber from 'bignumber.js';
import {PairService} from 'src/app/services/contracts/pair/pair.service';
import {ContractService} from 'src/app/services/contracts/contract.service';
import {NetworkService} from 'src/app/services/contract-connection/network.service';
import {AlertService} from '../../../_alert';
import {PandaSpinnerService} from '../../pandaspinner/pandaspinner.service';
import {mergeMap} from 'rxjs/operators';
import {Pair} from '../../../interfaces/pair';
import {MatTableDataSource} from '@angular/material/table';
import { Router } from '@angular/router';

const BLP_DECIMALS = 18;
const SHOW_DECIMALS = 5;
const TOKEN_1 = 1;
const TOKEN_2 = 2;

@Component({
  selector: 'app-search-pair',
  templateUrl: './search-pair.component.html',
  styleUrls: ['./search-pair.component.scss']
})
export class SearchPairComponent implements OnInit {

  addresses;

  net: string = environment.net;

  liquidityMiusTotal: LiquidityMinus[] = [{
    ammountNumber: 0,
    ammountToken: 'select Token'
  }];
  ammountPercentaje = 0;
  max = 100;
  min = 0;
  step = 1;
  thumbLabel = true;
  liquidityAmount: BigNumber;

  percents: number[] = [25, 50, 75, 100];

  pool: Pool;
  bamboo: Bamboo;
  liquidTool = false;

  reward: {
    tokenFirst: string,
    tokenSecond: string
  };

  username: string;

  listToken = [];
  tokenList: JSON[];
  error: boolean;
  errorAmmount: string;
  tokenEqual = false;

  balance: number;
  ammountBalance: number;

  isEth = false;

  pairData: PairData;
  liquidityData: TokenData;
  liquidityEstimate: LiquidityValue;
  tokenDataFirst: TokenData;
  tokenDataSecond: TokenData;

  errorNoPool = false;
  noPairs = false;
  isConnect: string;

  dataSource: MatTableDataSource<any>;
  availablePairs: Pair[] = [];
  observedPairs = 0;

  poolSelected: Pair;
  @Output() messageEvent = new EventEmitter<string>();
  constructor(
    private service: ServiceService,
    public dialog: MatDialog,
    private tokenService: TokenService,
    private routerService: RouterService,
    private utilsService: UtilService,
    private pairService: PairService,
    private contractService: ContractService,
    private alertService: AlertService,
    private pandaSpinnerService: PandaSpinnerService,
    private networkService: NetworkService,
    public router: Router
  ) {
    this.liquidityAmount = new BigNumber(0);
    this.addresses = networkService.getAddressNetwork();
  }

 ngOnInit(): void {
    // Initial values
    this.poolSelected = null;
    this.bamboo = {
      valor: 0.00,
      porcentaje: 0.00,
      liquidity: 0,
      porcentajeLiquidity: 0.00,
      fees: 0,
    };
    this.pool = {
      id: 'idPool1',
      logo: 'string',
      title: 'Bamboo grow!',
      pair: 'BAMBOO/WETH',
      address: '',
      logoTokenFirst: '',
      logoTokenSecond: '',
      addressTokenFirst: '',
      addressTokenSecond: '',
      underlyingToken: null,
      underlyingTokenFirst: '',
      underlyingTokenSecond: '',
      underlyingTokenFirstValue: null,
      underlyingTokenSecondValue: null,
      underlyingTokenFirstValueUSDT: null,
      underlyingTokenSecondValueUSDT: null,
      underlyingBamboo: null,
      value: null,
      yield: null,
      yieldReward: null,
      roiDaily: null,
      roiMonthly: null,
      roiYearly: null,
      tvl: null,
      available: null,
      staked: null,
      reward: null,
      isActive: true,
      isLoading: true,
      bambooPrice: null,
      isExcludedFromBambooPrice: null,
      roiYCompound: null
    };
    this.reward = {
      tokenFirst: '0',
      tokenSecond: '0'
    };
    this.getTokenList();
    this.isConnect = localStorage.getItem('connected');
    if (this.isConnect === 'connected') {
      this.getLPReserves().then();
    } else {
      this.noPairs = true;
    }

  }

  async getLPReserves(): Promise<void> {
    this.service.getPairList().pipe(
      mergeMap((res) => this.getPairsReserves(res))
    ).subscribe((res1) => {
   });
  }

  async getPairsReserves(res): Promise<void> {
    return new Promise(async resolve => {
      console.log(res);
      const pairs = res.pairs;
      this.observedPairs = 0;
      if (!pairs){
        this.noPairs = true;
      }
      for (const pair of pairs) {
        this.calcPairReserve(pair, pairs.length).then();
      }
      resolve();
      // resolve(pairs);
    });
  }

  async calcPairReserve(pair, length): Promise<void> {
    const tok1 = await this.tokenService.getTokenData(pair.addressTokenFirst,
      pair.pairTokenNameFirst === this.net && pair.addressTokenFirst === this.addresses.weth_address);
    const tok2 = await this.tokenService.getTokenData(pair.addressTokenSecond,
      pair.pairTokenNameSecond === this.net && pair.addressTokenSecond === this.addresses.weth_address);
    pair.pairData = await this.contractService.getPairInfo(tok1, tok2);
    pair.liquidityData = await this.tokenService.getTokenData(pair.pairAddress, false);
    if (this.utilsService.fromBNtoNumber(pair.liquidityData.balance) > 0 ) {
      this.availablePairs.push(pair);
    }
    this.observedPairs += 1;
  }

  // Get token list from service
  getTokenList(): void {
    this.service.getTokenListBamboo().subscribe(
      res => {
        this.tokenList = this.utilsService.sortTokenListBySymbol(res.tokens);
      });
  }

  // Select token FROM
  selectTokenFromList(): void {
    return this.openTokenList(TOKEN_1);
  }

  // Select token TO
  selectTokenToList(): void {
    return this.openTokenList(TOKEN_2);
  }


  // Open dialog to token list and select FROM and TO
  openTokenList(input): void {
    const tokenList = this.tokenList;
    const dialogRef = this.dialog.open(SelectToken, {
      width: '450px',
      data: {
        tokenList
      }
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result !== undefined) {
        if (input === TOKEN_1) {
          this.poolSelected = null;
          if (result.symbol === this.pool.underlyingTokenSecond) {
            this.tokenEqual = true;
            return;
          }
          this.tokenEqual = false;
          this.error = false;
          this.pool.underlyingTokenFirst = result.symbol;
          this.pool.logoTokenFirst = result.logoURI;
          this.pool.addressTokenFirst = result.address;
          await this.setToken(TOKEN_1);
        }
        if (input === TOKEN_2) {
          this.poolSelected = null;
          if (result.symbol === this.pool.underlyingTokenFirst) {
            this.tokenEqual = true;
            return;
          }
          this.tokenEqual = false;
          this.error = false;
          this.pool.underlyingTokenSecond = result.symbol;
          this.pool.logoTokenSecond = result.logoURI;
          this.pool.addressTokenSecond = result.address;
          await this.setToken(TOKEN_2);
        }
        // If both tokens are defined, search Metamask to see if it has a pool.
        if (this.pool.underlyingTokenFirst && this.pool.underlyingTokenSecond) {
          return await this.selectPool();
        } else {
          return;
        }
      }
    });
  }

  // After token is selected from list
  async setToken(where: number): Promise<void> {
    if (where === TOKEN_1) {
      this.tokenDataFirst = await this.tokenService.getTokenData(this.pool.addressTokenFirst,
        this.pool.underlyingTokenFirst === this.net && this.pool.addressTokenFirst === this.addresses.weth_address);
    } else if (where === TOKEN_2) {
      this.tokenDataSecond = await this.tokenService.getTokenData(this.pool.addressTokenSecond,
        this.pool.underlyingTokenSecond === this.net && this.pool.addressTokenSecond === this.addresses.weth_address);
    }
  }

  // When you have the two tokens selected, it looks to see if the pool exists.
  async selectPool(): Promise<void> {
    this.errorNoPool = false;
    // If the pool exists it returns the data and activates liquidTool showing the liquidity subtraction tools.
    this.pairData = await this.contractService.getPairInfo(this.tokenDataFirst, this.tokenDataSecond);
    if (this.pairData.addr === '0x0000000000000000000000000000000000000000') {
      this.error = true;
      this.pool.id = null;
    } else {
      if (this.pairData.reserve0.isZero() && this.pairData.reserve1.isZero()) {
        this.error = true;
        this.pool.id = null;
      } else {
        // Pair is valid
        this.error = false;
        this.pool.id = this.pairData.addr;
        // Check if pool is from ETH
        this.isEth = this.tokenDataFirst.isEth || this.tokenDataSecond.isEth;
        // Get the data of liquidity
        this.liquidityData = await this.tokenService.getTokenData(this.pairData.addr, false);
        this.pool.reward = Number(this.liquidityData.balance.toFixed(BLP_DECIMALS));
        // await this.setRewards();
      }
    }
    if (this.pool.id) {
      this.liquidTool = true;
      this.getPair();
    }
    if (!this.pool.id) {
      this.liquidTool = false;
      this.errorNoPool = true;
    }
  }

  // When the pool selected is equal to an available pair, set the minus-liquidity-pair component
  getPair(): void {
    this.availablePairs.forEach(pair => {
      if (this.pool.underlyingTokenFirst === pair.pairTokenNameFirst ||
        this.pool.underlyingTokenFirst === pair.pairTokenNameSecond){
          if (this.pool.underlyingTokenSecond === pair.pairTokenNameSecond ||
            this.pool.underlyingTokenSecond === pair.pairTokenNameFirst){
            console.log(pair);
            return this.poolSelected = pair;
          }
        }
    });
  }

  backToLiquidity(): void{
    const pool = 2;
    this.router.navigateByUrl('pages/wallet/' + pool);
  }

}
