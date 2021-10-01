import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {LiquidityPlus} from 'src/app/interfaces/liquidity-plus';
import {ServiceService} from 'src/app/services/service.service';
import {environment} from 'src/environments/environment';
import {ConfirmComponent} from '../../confirm/confirm.component';
import {SelectToken} from '../to-trade/to-trade.component';
import {TokenService} from 'src/app/services/contracts/token/token.service';
import {RouterService} from 'src/app/services/contracts/router/router.service';
import {UtilService} from 'src/app/services/contracts/utils/util.service';
import {PairData, TokenData} from 'src/app/interfaces/contracts';
import BigNumber from 'bignumber.js';
import {PairService} from 'src/app/services/contracts/pair/pair.service';
import {ContractService} from 'src/app/services/contracts/contract.service';
import {NetworkService} from 'src/app/services/contract-connection/network.service';
import {AlertService} from '../../../_alert';
import {PandaSpinnerService} from '../../pandaspinner/pandaspinner.service';
import {ConnectionService} from '../../../services/contract-connection/connection.service';
import {ActivatedRoute, Router} from '@angular/router';

const SHOW_DECIMALS = 6;
const FLOOR_DECIMALS = 100000;

const TOKEN_1 = 1;
const TOKEN_2 = 2;

@Component({
  selector: 'app-liquidity-plus',
  templateUrl: './liquidity-plus.component.html',
  styleUrls: ['./liquidity-plus.component.scss']
})
export class LiquidityPlusComponent implements OnInit {

  addresses;
  pairAddress: string = this.route.snapshot.paramMap.get('address');
  pairAddressToken1: string = this.route.snapshot.paramMap.get('id1');
  pairAddressToken2: string = this.route.snapshot.paramMap.get('id2');
  isConnected = false;
  net: string = environment.net;

  liquidityPlus: LiquidityPlus = {
    inputFirst: null,
    inputSecond: null,
    firstPerSecond: '0',
    secondPerFirst: '0',
    poolAllocation: '0',
    shareOfPool: '0',
    tokenFirst: {
      icon: '',
      name: '',
      addr: '',
      isEth: false,
    },
    tokenSecond: {
      icon: '',
      name: '',
      addr: '',
      isEth: false,
    },
    inputBalanceFirst: '0',
    inputBalanceSecond: '0',
    position: '0',
    positionFirst: '0',
    positionSecond: '0',
  };

  tokenList: any;

  pairData: PairData;
  tokenDataFirst: TokenData;
  tokenDataSecond: TokenData;
  longInputFirst: BigNumber;
  longInputSecond: BigNumber;

  error: boolean;
  errorText: string;
  firstPool = false;

  approvedPairFirst = false;
  approvedPairSecond = false;
  approvedPair = false;


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
    private connService: ConnectionService,
    private networkService: NetworkService,
    private router: Router,
    private route: ActivatedRoute,

  ) {
    this.addresses = networkService.getAddressNetwork();
  }

  ngOnInit(): void {
    this.isConnected = this.connService.provider !== undefined;
    this.getTokenList();
  }

  // Get token list from service
  getTokenList(): void {
    this.service.getTokenListBamboo().subscribe(
      res => {
        this.tokenList = this.utilsService.sortTokenListBySymbol(res.tokens);
        if (this.pairAddressToken1 && this.pairAddressToken2){
          this.getPairFromPreviousSelection( this.tokenList, this.pairAddressToken1, this.pairAddressToken2);
        }
      });
  }

  async setValues(where: number): Promise<void> {

    let input: BigNumber;
    if (where === 1 && this.utilsService.validateInput(this.liquidityPlus.inputFirst) && this.tokenDataFirst) {
      const share = this.liquidityPlus.inputFirst / (Number(this.liquidityPlus.positionFirst) + this.liquidityPlus.inputFirst) * 100;
      this.liquidityPlus.shareOfPool = String(share.toFixed(3)) + ' %';
      input = new BigNumber(this.liquidityPlus.inputFirst);
      if (input.isGreaterThan(this.tokenDataFirst.balance)) {
        // TODO: Translate error msg
        this.error = true;
        this.errorText = 'Insufficient Balance ' + this.liquidityPlus.tokenFirst.name;
      } else {
        this.error = false;
      }
      this.longInputFirst = input;
      if (!this.firstPool && this.tokenDataSecond) {
        this.longInputSecond = this.utilsService.getOtherAmountOfPair(input, this.tokenDataFirst.addr, this.pairData);
        this.liquidityPlus.inputSecond = Number(this.longInputSecond.toFixed(SHOW_DECIMALS));
        if (this.longInputSecond.isGreaterThan(this.tokenDataSecond.balance)) {
          // TODO: Translate error msg
          this.error = true;
          this.errorText = 'Insufficient Balance ' + this.liquidityPlus.tokenSecond.name;
        } else {
          this.error = false;
        }
      }
    } else if (where === 2 && this.utilsService.validateInput(this.liquidityPlus.inputSecond) && this.tokenDataSecond) {
      input = new BigNumber(this.liquidityPlus.inputSecond);
      if (input.isGreaterThan(this.tokenDataSecond.balance)) {

        // TODO: Translate error msg
        this.error = true;
        this.errorText = 'Insufficient Balance ' + this.liquidityPlus.tokenSecond.name;
      } else {
        this.error = false;
      }
      this.longInputSecond = input;
      if (!this.firstPool && this.tokenDataFirst) {
        this.longInputFirst = this.utilsService.getOtherAmountOfPair(input, this.tokenDataSecond.addr, this.pairData);
        this.liquidityPlus.inputFirst = Number(this.longInputFirst.toFixed(SHOW_DECIMALS));
        const share = this.liquidityPlus.inputFirst / (Number(this.liquidityPlus.positionFirst) + this.liquidityPlus.inputFirst) * 100;
        this.liquidityPlus.shareOfPool = String(share.toFixed(3)) + ' %';
        if (this.longInputFirst.isGreaterThan(this.tokenDataFirst.balance)) {
          // TODO: Translate error msg
          this.error = true;
          this.errorText = 'Insufficient Balance ' + this.liquidityPlus.tokenFirst.name;
        } else {
          this.error = false;
        }
      }
    } else {

    }
  }

  // Open dialog to select token from previous list
  openTokenList(input): void {
    const dialogRef = this.dialog.open(SelectToken, {
      width: '450px',
      data: {
        tokenList: this.tokenList
      }
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      this.approvedPair = false;
      if (result !== undefined) {
        if (input === TOKEN_1) {
          this.liquidityPlus.tokenFirst.name = result.symbol;
          this.liquidityPlus.tokenFirst.icon = result.logoURI;
          this.liquidityPlus.tokenFirst.addr = result.address;
          this.liquidityPlus.tokenFirst.isEth = this.tokenService.isEth(result.address, result.symbol);
        }
        if (input === TOKEN_2) {
          this.liquidityPlus.tokenSecond.name = result.symbol;
          this.liquidityPlus.tokenSecond.icon = result.logoURI;
          this.liquidityPlus.tokenSecond.addr = result.address;
          this.liquidityPlus.tokenSecond.isEth = this.tokenService.isEth(result.address, result.symbol);
        }
        await this.setToken(input);

        // If there are two tokens selected, check if the pool exist
        if (this.liquidityPlus.tokenFirst.name && this.liquidityPlus.tokenSecond.name) {
          await this.validatePair();
        }
      }
    });
  }

  async setToken(where: number): Promise<void> {
    this.liquidityPlus.inputFirst = null;
    this.liquidityPlus.inputSecond = null;
    this.approvedPair = false;
    if (where === TOKEN_1) {
      this.tokenDataFirst = await this.tokenService.getTokenData(
        this.liquidityPlus.tokenFirst.addr, this.liquidityPlus.tokenFirst.isEth);
      this.liquidityPlus.inputBalanceFirst = this.tokenDataFirst.balance.toFixed(SHOW_DECIMALS);
    } else if (where === TOKEN_2) {
      this.tokenDataSecond = await this.tokenService.getTokenData(
        this.liquidityPlus.tokenSecond.addr, this.liquidityPlus.tokenSecond.isEth);
      this.liquidityPlus.inputBalanceSecond = this.tokenDataSecond.balance.toFixed(SHOW_DECIMALS);
    }
  }

  // Merged with firstPoolActive()
  async validatePair(): Promise<void> {
    this.error = false;
    this.firstPool = false;
    this.pairData = await this.contractService.getPairDBInfoAddresses(this.tokenDataFirst.addr, this.tokenDataSecond.addr);
    if (this.pairData.addr === 'null') {
      this.firstPool = true;
    } else {
      const AperB = this.utilsService.getOtherAmountOfPair(new BigNumber(1), this.tokenDataSecond.addr, this.pairData);
      const BperA = this.utilsService.getOtherAmountOfPair(new BigNumber(1), this.tokenDataFirst.addr, this.pairData);
      this.liquidityPlus.firstPerSecond = AperB.toFixed(this.tokenDataSecond.decimals);
      this.liquidityPlus.secondPerFirst = BperA.toFixed(this.tokenDataFirst.decimals);
      this.liquidityPlus.shareOfPool = '0.000 %';
      // Swap if tokens are out of order
      let reserve0 = this.pairData.reserve0;
      let reserve1 = this.pairData.reserve1;
      if (this.pairData.token0 === this.liquidityPlus.tokenSecond.addr) {
        reserve0 = this.pairData.reserve1;
        reserve1 = this.pairData.reserve0;
      }
      this.liquidityPlus.positionFirst = reserve0.toFixed(SHOW_DECIMALS);
      this.liquidityPlus.positionSecond = reserve1.toFixed(SHOW_DECIMALS);

      // Ask if this pair is allowed or not
      this.checkIsAllowed();
    }
  }

  // Set if the pair is allowed or not
  async checkIsAllowed(): Promise<void> {
    this.approvedPair = false;
    this.approvedPairFirst = false;
    this.approvedPairSecond = false;
    if (!this.liquidityPlus.tokenFirst.name || !this.liquidityPlus.tokenSecond.name) {
      return;
    }
    try {
      const allowance1 = Number(await this.tokenService.getAllowance(this.tokenDataFirst.addr, this.addresses.router_address));
      this.approvedPairFirst = allowance1 > 0;
      const allowance2 = Number(await this.tokenService.getAllowance(this.tokenDataSecond.addr, this.addresses.router_address));
      this.approvedPairSecond = allowance2 > 0;
    } catch {
      this.approvedPair = false;
    } finally {
      this.approvedPair = this.approvedPairFirst && this.approvedPairSecond;
    }
  }

  async approveTokens(): Promise<void> {
    this.pandaSpinnerService.open();
    if (!this.approvedPairFirst){
      try {
        const tokenData = await this.tokenService.getTokenData(this.liquidityPlus.tokenFirst.addr, this.liquidityPlus.tokenFirst.isEth);
        const receipt = await this.tokenService.approve(tokenData, this.addresses.router_address);
        if (receipt.status === true) {
          this.approvedPairFirst = true;
          this.alertService.success('Token ' + this.liquidityPlus.tokenFirst.name + ' approved!');
        }
      } catch (e) {
        this.alertService.error('Error: ' + e.message);
      }
    }
    if (!this.approvedPairSecond){
      try {
        const tokenData = await this.tokenService.getTokenData(this.liquidityPlus.tokenSecond.addr, this.liquidityPlus.tokenSecond.isEth);
        const receipt = await this.tokenService.approve(tokenData, this.addresses.router_address);
        if (receipt.status === true) {
          this.approvedPairSecond = true;
          this.alertService.success('Success');
          this.alertService.success('Token ' + this.liquidityPlus.tokenSecond.name + ' approved!');
        }
      } catch (e) {
        this.alertService.error('Error: ' + e.message);
      }
    }
    this.approvedPair = this.approvedPairFirst && this.approvedPairSecond;
    this.pandaSpinnerService.close();
  }

  // Add liquidity to Pair. Open dialog to confirm
  async addLiquidityToPair(): Promise<void> {
    const operationData = {
      name: 'liquidity-plus',
      liquidityPlus: this.liquidityPlus,
    };

    // Confirm Dialog
    const dialogRef = this.dialog.open(ConfirmComponent, {
      width: '450px',
      data: operationData
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        this.pandaSpinnerService.open();
        try {
          // Get slippage and deadline values
          const slippage = Number(localStorage.getItem('slippage'));
          // Deadline to seconds
          const deadline = Number(localStorage.getItem('transDeadLine')) * 60;
          const receipt = await this.routerService.addLiquidityAny(this.tokenDataFirst, this.tokenDataSecond,
            this.longInputFirst, this.longInputSecond, slippage, deadline,
            this.liquidityPlus.tokenFirst.isEth || this.liquidityPlus.tokenSecond.isEth);

          // Only reset amounts, keep token selections
          await this.clearForm();
          this.alertService.success('Success');
        } catch (error) {
          this.alertService.error('Error: ' + error.message);
        } finally {
          this.pandaSpinnerService.close();
        }
      } else {
        return;
      }
    });
  }

  async clearForm(): Promise<void> {
    this.liquidityPlus = {
      inputFirst: null,
      inputSecond: null,
      firstPerSecond: '0',
      secondPerFirst: '0',
      poolAllocation: '0',
      shareOfPool: '0',
      tokenFirst: {
        icon: '',
        name: '',
        addr: '',
        isEth: false,
      },
      tokenSecond: {
        icon: '',
        name: '',
        addr: '',
        isEth: false,
      },
      inputBalanceFirst: '0',
      inputBalanceSecond: '0',
      position: '0',
      positionFirst: '0',
      positionSecond: '0',
    };
    this.longInputFirst = null;
    this.longInputSecond = null;
    this.pairData = null;
    this.tokenDataFirst = null;
    this.tokenDataSecond = null;
    this.error = false;
    this.firstPool = false;
    this.approvedPair = false;
    this.approvedPairFirst = false;
    this.approvedPairSecond = false;
  }

  totalToAddFirst(): void{
    this.liquidityPlus.inputFirst = Math.floor(Number(this.liquidityPlus.inputBalanceFirst) * FLOOR_DECIMALS) / FLOOR_DECIMALS;
    this.setValues(1);
  }

  totalToAddSecond(): void{
    this.liquidityPlus.inputSecond = Math.floor(Number(this.liquidityPlus.inputBalanceSecond) * FLOOR_DECIMALS) / FLOOR_DECIMALS;
    this.setValues(2);
  }

  goToCreatePair(): void{
    this.router.navigateByUrl('pages/pair-create');
  }

  async getPairFromPreviousSelection(list, token1, token2): Promise<void>{
    list.forEach( element => {
      if (element.address === token1) {
        this.liquidityPlus.tokenFirst.name = element.symbol;
        this.liquidityPlus.tokenFirst.icon = element.logoURI;
        this.liquidityPlus.tokenFirst.addr = element.address;
        this.liquidityPlus.tokenFirst.isEth = this.tokenService.isEth(element.address, element.symbol);
    }
      if (element.address === token2) {
        this.liquidityPlus.tokenSecond.name = element.symbol;
        this.liquidityPlus.tokenSecond.icon = element.logoURI;
        this.liquidityPlus.tokenSecond.addr = element.address;
        this.liquidityPlus.tokenSecond.isEth = this.tokenService.isEth(element.address, element.symbol);
      }
    });
    await this.setToken(1);
    await this.setToken(2);
    await this.validatePair();
  }

  backToLiquidity(): void{
    if (  this.pairAddressToken1 && this.pairAddressToken2) {
      this.router.navigateByUrl('pages/farms');
      return;
    }

    const pool = 2;
    this.router.navigateByUrl('pages/wallet/' + pool);
  }
}
