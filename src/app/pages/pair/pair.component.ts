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
  pair: Pair = {
    id: 'idPool2',
    logoTokenFirst: 'https://raw.githubusercontent.com/bamboo-defi/bamboodefi-frontend/main/src/assets/bamboo-head.png',
    logoTokenSecond: 'https://raw.githubusercontent.com/grupokindynos/kindynos-branding/master/polis/polis-isotype-background-round.png',
    pairTokenNameFirst: 'BAMBOO',
    pairTokenNameSecond: 'POLIS',
    addressTokenFirst: '0x86f725b1a47e6003c19d6675fea0156625d07d61',
    addressTokenSecond: '0x1377d26E4f427739c0498E748f747f8063Bd675b',
    pairAddress: '0xF10E6e664E5aE4b8b7d3FD81655d0bcAebB32fF4',
    liquidity: 0.0,
    liquidityPercentaje: 0.0,
    volume24: 0.0,
    volume24Percentaje: 0.0,
    volume7: 0.0,
    volume7Percentaje: 0.0,
    fees24: 0.0,
    fees24Percentaje: 0.0,
    feesYear: 0.0,
    feesYearPercentaje: 0.0,
    pairFirstEqualSecond: 0.0,
    pairSecondEqualFirst: 0.0,
    ammountFirst: 0.0,
    ammountSecond: 0.0,
  };


  pairData: PairData;
  tokenDataFirst: TokenData;
  tokenDataSecond: TokenData;

  // CHART
  public lineChartData: ChartDataSets[] = [
    {data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A'},
    {data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B'},
    {data: [180, 480, 770, 90, 1000, 270, 400], label: 'Series C', yAxisID: 'y-axis-1'}
  ];
  public lineChartLabels: Label[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  public lineChartOptions: (ChartOptions & { annotation: any }) = {
    responsive: true,
    scales: {
      xAxes: [{}],
      yAxes: [
        {
          id: 'y-axis-0',
          position: 'left',
        },
        {
          id: 'y-axis-1',
          position: 'right',
          gridLines: {
            color: 'rgba(255,0,0,0.3)',
          },
          ticks: {
            fontColor: 'red',
          }
        }
      ]
    },
    annotation: {
      annotations: [
        {
          type: 'line',
          mode: 'vertical',
          scaleID: 'x-axis-0',
          value: 'March',
          borderColor: 'orange',
          borderWidth: 2,
          label: {
            enabled: true,
            fontColor: 'orange',
            content: 'LineAnno'
          }
        },
      ],
    },
  };
  public lineChartColors: Color[] = [
    {
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    {
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    {
      backgroundColor: 'rgba(255,0,0,0.3)',
      borderColor: 'red',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartLegend = true;
  public lineChartType: ChartType = 'line';
  public lineChartPlugins = [];

  pairTrans = this.service.getPair();
  isWait = false;

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
    if (this.pairTrans) {
      console.log('recivido pair');
      console.log(this.pairTrans);
    } else {
      console.log('no recibido');
    }
  }

  ngOnInit(): void {

    this.isWait = localStorage.getItem('connected') === 'disconnected';
    this.connected();

  }

  connected(): void{
    if (this.isWait){
      console.log('mieradputa');
      this.router.navigateByUrl('/pages/pools');
    } else {
    this.pairId = this.route.snapshot.paramMap.get('id');
    this.pair.addressTokenFirst = this.pairTrans.addressTokenFirst;
    this.pair.addressTokenSecond = this.pairTrans.addressTokenSecond;
    this.pair.logoTokenFirst = this.pairTrans.logoTokenFirst;
    this.pair.logoTokenSecond = this.pairTrans.logoTokenSecond;
    this.pair.pairTokenNameFirst = this.pairTrans.underlyingTokenFirst;
    this.pair.pairTokenNameSecond = this.pairTrans.underlyingTokenSecond;
    this.pair.ammountFirst = this.pairTrans.underlyingTokenFirstValue;
    this.pair.ammountSecond = this.pairTrans.underlyingTokenSecondValue;
    this.pair.pairAddress = this.pairTrans.address;
    this.pair.id = this.pairTrans.id;
    this.getPairMarket();
  }
  }

  // TODO get pair values
  async getPairMarket(): Promise<void> {
    if (!this.contractService.isConnection()) {
      return;
    }
    // Filling all values that can be obtained through the blockchain
    this.tokenDataFirst = await this.tokenService.getTokenData(this.pair.addressTokenFirst);
    this.tokenDataSecond = await this.tokenService.getTokenData(this.pair.addressTokenSecond);
    this.pairData = await this.contractService.getPairInfo(this.tokenDataFirst, this.tokenDataSecond);
    // Get the order of the pair data
    let swap = false;
    if (!this.utilsService.compareEthAddr(this.tokenDataFirst.addr, this.pairData.token0)) {
      swap = true;
      const aux = this.tokenDataFirst;
      this.tokenDataFirst = this.tokenDataSecond;
      this.tokenDataSecond = aux;
    }
    const AperB = this.utilsService.getOtherAmountOfPair(new BigNumber(1), this.tokenDataSecond.addr, this.pairData);
    const BperA = this.utilsService.getOtherAmountOfPair(new BigNumber(1), this.tokenDataFirst.addr, this.pairData);
    // Save the data
    if (swap) {
      this.pair.pairFirstEqualSecond = Number(AperB.toFixed(SHOW_DECIMALS));
      this.pair.pairSecondEqualFirst = Number(BperA.toFixed(SHOW_DECIMALS));
      this.pair.ammountFirst = Number(this.pairData.reserve1.toFixed(SHOW_DECIMALS));
      this.pair.ammountSecond = Number(this.pairData.reserve0.toFixed(SHOW_DECIMALS));
    } else {
      this.pair.pairFirstEqualSecond = Number(BperA.toFixed(SHOW_DECIMALS));
      this.pair.pairSecondEqualFirst = Number(AperB.toFixed(SHOW_DECIMALS));
      this.pair.ammountFirst = Number(this.pairData.reserve0.toFixed(SHOW_DECIMALS));
      this.pair.ammountSecond = Number(this.pairData.reserve1.toFixed(SHOW_DECIMALS));
    }
  }

  // Go to previous page
  back(): void {
    this.location.back();
  }
}
