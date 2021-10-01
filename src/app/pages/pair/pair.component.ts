import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Pair} from 'src/app/interfaces/pair';
import {Location} from '@angular/common';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {Label, Color, BaseChartDirective} from 'ng2-charts';
import BigNumber from 'bignumber.js';
import {PairData, TokenData} from '../../interfaces/contracts';
import {TokenService} from 'src/app/services/contracts/token/token.service';
import {PairService} from 'src/app/services/contracts/pair/pair.service';
import {UtilService} from '../../services/contracts/utils/util.service';
import {ContractService} from '../../services/contracts/contract.service';
import { ServiceService } from 'src/app/services/service.service';

const SHOW_DECIMALS = 5;

@Component({
  selector: 'app-pair',
  templateUrl: './pair.component.html',
  styleUrls: ['./pair.component.scss']
})
export class PairComponent implements OnInit {

  pairId: string;
  pairAddress: string = this.route.snapshot.paramMap.get('address');
  pair: Pair = {
    id: '',
    logoTokenFirst: '',
    logoTokenSecond: '',
    pairTokenNameFirst: '',
    pairTokenNameSecond: '',
    addressTokenFirst: '',
    addressTokenSecond: '',
    pairAddress: this.pairAddress,
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
    ammountSecond: 0,
  };


  pairData: PairData;
  tokenDataFirst: TokenData;
  tokenDataSecond: TokenData;

  pairTrans = this.service.getPair();
  // isWait = false;

  @ViewChild(BaseChartDirective, {static: true}) chart: BaseChartDirective;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private tokenService: TokenService,
    private utilsService: UtilService,
    private pairService: PairService,
    private contractService: ContractService,
    private service: ServiceService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.connected();

  }

  async connected(){
    this.pairAddress = this.route.snapshot.paramMap.get('address');
    if (this.pairAddress === undefined){
      this.router.navigateByUrl('/pages/pools');
    }
    this.pair = await this.contractService.getPairDBInfo(this.pairAddress);
    console.log('pair', this.pair);
  }

  // Go to previous page
  back(): void {
    this.location.back();
  }
}
