import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { Token } from '@angular/compiler/src/ml_parser/lexer';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Slippage } from 'src/app/interfaces/slippage';
import { ToTrade } from 'src/app/interfaces/to-trade';
import { ServiceService } from 'src/app/services/service.service';
import { environment } from 'src/environments/environment';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { TokenService } from 'src/app/services/contracts/token/token.service';
import { RouterService } from 'src/app/services/contracts/router/router.service';
import { UtilService } from 'src/app/services/contracts/utils/util.service';
import { PairData, TokenData } from 'src/app/interfaces/contracts';
import BigNumber from 'bignumber.js';
import { ContractService } from 'src/app/services/contracts/contract.service';
import {NetworkService} from 'src/app/services/contract-connection/network.service';
import { AlertService } from '../../../_alert';
import { PandaSpinnerService } from '../../pandaspinner/pandaspinner.service';
import {ActivatedRoute, Router} from '@angular/router';
import { concatMap } from 'rxjs/operators';

const SHOW_DECIMALS = 5;
const FLOOR_DECIMALS = 1000000;

@Component({
  selector: 'app-to-trade',
  templateUrl: './to-trade.component.html',
  styleUrls: ['./to-trade.component.scss']
})
export class ToTradeComponent implements OnInit {

  addresses;
  pairAddressToken1: string = this.route.snapshot.paramMap.get('id1');
  pairAddressToken2: string = this.route.snapshot.paramMap.get('id2');
  net: string = environment.net;

  token: Token;
  wallet: ToTrade = {
    id: 'id',
    from: null,
    to: null,
    balanceFrom: '0',
    balanceTo: '0',
    Recipient: 0,
    tokenFrom: {
      name: null,
      icon: null,
      symbol: null,
      logoURI: null,
      ammount: 0,
      address: '0'
    },
    tokenTo: {
      name: null,
      icon: null,
      symbol: null,
      logoURI: null,
      ammount: 0,
      address: '0'
    },
    recipient: null,
    tokenIntermediate: [
      {
        name: null,
        icon: null,
        symbol: null,
        logoURI: null,
        ammount: 0
      }
    ],
  };
  slippages: Slippage[] = [
    { value: 0.1 },
    { value: 0.5 },
    { value: 1 },
  ];

  fromValuePercentaje = [
    { value: 25 },
    { value: 50 },
    { value: 100 },
  ];

  listToken = [];
  tokenList: JSON[];

  // 0 is false, 1 ETH is From, 2 ETH is To
  isEth = 0;
  // 1 is ExactFrom, 2 is ExactTo
  tradeType = 1;

  pairData: PairData;
  tokenDataFrom: TokenData;
  tokenDataTo: TokenData;
  longInputFrom: BigNumber;
  longInputTo: BigNumber;

  addSendWallet = false;

  minimunReceived: string;
  priceImpact: string;
  liqProviderFee: string;

  betterDealBlock = false;
  showBetterDealBlock = false;

  tradeOk = 'to-trade.trade';

  error: boolean;
  errorText: string;

  estimatedTo = false;
  estimatedFrom = false;

  constructor(
    private service: ServiceService,
    public dialog: MatDialog,
    private tokenService: TokenService,
    private routerService: RouterService,
    private utilsService: UtilService,
    private contractService: ContractService,
    private alertService: AlertService,
    private pandaSpinnerService: PandaSpinnerService,
    private networkService: NetworkService,
    private route: ActivatedRoute,
  ) {
    this.addresses = networkService.getAddressNetwork();
  }

  ngOnInit(): void {
    console.log(this.pairAddressToken2);
    // Set valid token list
    this.getTokenList();
  }

  // On change form value. One of the values will be exact and the other will be estimated
  setValues(type: number): void {
    let input: BigNumber;
    // Exact From and estimated To
    if (type === 1 && this.utilsService.validateInput(this.wallet.from) && this.tokenDataFrom) {
      this.tradeType = 1;
      input = new BigNumber(this.wallet.from);
      // Validate balance
      if (input.isGreaterThan(this.tokenDataFrom.balance)) {
        this.error = true;
        this.errorText = 'to-stake.errorTextNoFunds';
      } else {
        this.error = false;
      }
      this.longInputFrom = input;
      // Autocomplete if token was defined
      if (this.tokenDataTo) {
        this.longInputTo = this.utilsService.getAmountOut(input, this.tokenDataFrom, this.pairData);
        if (this.longInputFrom.isZero()) {
          // TODO: error msg for insufficient liquidity
          this.error = true;
          this.errorText = 'Insufficient liquidity in pair';
        }
        this.wallet.to = Number(this.longInputTo.toFixed(SHOW_DECIMALS));
        this.estimatedFrom = false;
        this.estimatedTo = true;

      }
    } // Estimated From and exact To
    else if (type === 2 && this.utilsService.validateInput(this.wallet.to) && this.tokenDataTo) {
      this.tradeType = 2;
      input = new BigNumber(this.wallet.to);
      this.longInputTo = input;
      if (this.tokenDataFrom) {
        this.longInputFrom = this.utilsService.getAmountIn(input, this.tokenDataTo, this.pairData);
        // Insufficient liquidity case
        if (this.longInputFrom.isZero()) {
          // TODO: error msg for insufficient liquidity
          this.error = true;
          this.errorText = 'Insufficient liquidity in pair';
        } else {
          this.error = false;
        }
        this.wallet.from = Math.floor(Number(this.longInputFrom) * FLOOR_DECIMALS) / FLOOR_DECIMALS;
        this.estimatedFrom = true;
        this.estimatedTo = false;
        if (this.longInputFrom.isGreaterThan(this.tokenDataFrom.balance)) {
          this.error = true;
          this.errorText = 'to-stake.errorTextNoFunds';
        }
      }
    }

    // Calculate minReceived and priceImpact
    if (this.longInputTo && this.wallet.tokenTo) {
      const slippage = Number(localStorage.getItem('slippage'));
      this.minimunReceived = this.longInputTo.times((1000 - slippage)).dividedBy(1000).toFixed(SHOW_DECIMALS);
      // Find out reserve of In
      let reserveFrom;
      if (this.utilsService.compareEthAddr(this.tokenDataFrom.addr, this.pairData.token0)) {
        reserveFrom = this.pairData.reserve0;
      } else {
        reserveFrom = this.pairData.reserve1;
      }
      this.priceImpact = this.utilsService.getPriceImpact(this.longInputFrom, this.pairData.fee, reserveFrom) + ' %';
    }
  }

  // On change address
  async validateAddress(): Promise<void> {
    if (!(await this.contractService.validateAddress(this.wallet.recipient))) {
      // TODO: error msg for invalid address
      this.error = true;
      this.errorText = 'Invalid Address';
    } else {
      this.error = false;
    }
  }


  // tslint:disable-next-line:typedef
  onSubmit() {
    // If no token selected
    if (!this.wallet.tokenTo.name || !this.wallet.tokenFrom.name) {
      this.error = true;
      this.errorText = 'to-stake.errorTextToken';
      return;
    }

    // If everithing is ok
    // Operation Data
    const operationData = {
      name: 'to-trade',
      toAmmount: this.wallet.to,
      toName: this.wallet.tokenTo.name,
      toIcon: this.wallet.tokenTo.icon,
      fromAmmount: this.wallet.from,
      fromName: this.wallet.tokenFrom.name,
      fromIcon: this.wallet.tokenFrom.icon,
      recipient: this.wallet.recipient,
      minimunReceived: this.minimunReceived,
      priceImpact: this.priceImpact,
      liqProviderFee: this.liqProviderFee,
      routeToken: this.wallet.tokenIntermediate
    };

    // Confirm Dialog
    const dialogRef = this.dialog.open(ConfirmComponent, {
      width: '450px',
      data: operationData
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Operation accepted
        this.assignProductsToUsers(); // Restart wallet values
      } else {
        return;
      }
    });
  }

  // Set percentaje ammount
  loadPercentajeFrom(data): number {
    // TODO porcentaje data sobre ammount total
    this.longInputFrom = this.tokenDataFrom.balance.times(data / 100);
    const roundedAmount = Math.floor(Number(this.longInputFrom) * FLOOR_DECIMALS) / FLOOR_DECIMALS /*this.longInputFrom.toFixed(SHOW_DECIMALS)*/;
    this.wallet.from = Number(roundedAmount);
    this.setValues(1);
    return roundedAmount;
  }

  // Get token list from service
  getTokenList(): void {
    this.service.getTokenListBamboo().subscribe(
      res => {
        this.tokenList = this.utilsService.sortTokenListBySymbol(res.tokens);
        if (this.pairAddressToken1 && this.pairAddressToken2){
          this.getPairFronPreviousSelection( this.tokenList, this.pairAddressToken1, this.pairAddressToken2);
        }

      });
  }

  // Add wallet to send
  addSend(): boolean {
    if (this.addSendWallet === false) {
      return this.addSendWallet = true;
    }
    this.wallet.recipient = null;
    // TODO: If invalid address and removing addSend interaction
    if (this.error && this.errorText === 'Invalid Address') {
      this.error = false;
    }
    return this.addSendWallet = false;
  }

  // Change direction of selected tokens
  async changeDirection(): Promise<void> {
    const to = this.wallet.to;
    const toName = this.wallet.tokenTo.name;
    const toAmmount = this.wallet.tokenTo.ammount;
    const toIcon = this.wallet.tokenTo.icon;
    const toAddress = this.wallet.tokenTo.address;
    const from = this.wallet.from;
    const fromName = this.wallet.tokenFrom.name;
    const fromAmmount = this.wallet.tokenFrom.ammount;
    const fromIcon = this.wallet.tokenFrom.icon;
    const fromAddress = this.wallet.tokenFrom.address;

    this.wallet.to = from;
    this.wallet.tokenTo.name = fromName;
    this.wallet.tokenTo.ammount = fromAmmount;
    this.wallet.tokenTo.icon = fromIcon;
    this.wallet.tokenTo.address = fromAddress;
    this.wallet.from = to;
    this.wallet.tokenFrom.name = toName;
    this.wallet.tokenFrom.ammount = toAmmount;
    this.wallet.tokenFrom.icon = toIcon;
    this.wallet.tokenFrom.address = toAddress;

    await this.setToken(1);
    await this.setToken(2);
    await this.setValues(this.tradeType);
  }

  // In case of better deal in AMM, show this blok
  betterDeal(): boolean {
    if (this.wallet.from && this.wallet.tokenFrom.symbol && this.wallet.tokenTo.symbol) {
      // TODO Set if better deal Uniswap
      return this.betterDealBlock = true;
    } else {
      return this.betterDealBlock = false;
    }
  }

  // Show the BetterDeal option
  showBetterDeal(): boolean {
    return this.showBetterDealBlock = true;
  }

  // select token FROM
  selectTokenFromList(): void {
    return this.openTokenList(1);
  }

  // select token TO
  selectTokenToList(): void {
    return this.openTokenList(2);
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
        if (input === 1) {
          console.log(result);
          // If repeat the token
          if (result.symbol === this.wallet.tokenTo.name) {
            this.error = true;
            this.errorText = 'to-stake.errorTextToken';
            return;
          }
          this.error = false;
          this.wallet.tokenFrom.name = result.symbol;
          this.wallet.tokenFrom.icon = result.logoURI;
          this.wallet.tokenFrom.address = result.address;
          await this.setToken(1);
        }
        if (input === 2) {
          // If repeat the token
          if (result.symbol === this.wallet.tokenFrom.name) {
            this.error = true;
            this.errorText = 'to-stake.errorTextToken';
            return;
          }
          this.error = false;
          this.wallet.tokenTo.name = result.symbol;
          this.wallet.tokenTo.icon = result.logoURI;
          this.wallet.tokenTo.address = result.address;
          await this.setToken(2);
        }
        // If there are two tokens selected, check if the pool exist
        const canValidatePair = this.wallet.tokenFrom.name && this.wallet.balanceFrom && this.wallet.tokenTo.name && this.wallet.balanceTo;
        if (canValidatePair) {
          await this.validatePair();
        }
      }
    });
  }

  // After token is selected from list
  async setToken(where: number): Promise<void> {
    let isEth = false;
    // Hardcoded addresses for kovan testing
    if (where === 1) {
      isEth = this.wallet.tokenFrom.name === this.net && this.utilsService.compareEthAddr(this.wallet.tokenFrom.address, this.addresses.weth_address);
      this.tokenDataFrom = await this.tokenService.getTokenData(this.wallet.tokenFrom.address, isEth);
      this.wallet.balanceFrom = this.tokenDataFrom ? this.tokenDataFrom.balance.toFixed(SHOW_DECIMALS) : null;
    } else if (where === 2) {
      isEth = this.wallet.tokenTo.name === this.net && this.utilsService.compareEthAddr(this.wallet.tokenTo.address, this.addresses.weth_address);
      this.tokenDataTo = await this.tokenService.getTokenData(this.wallet.tokenTo.address, isEth);
      this.wallet.balanceTo = this.tokenDataTo ? this.tokenDataTo.balance.toFixed(SHOW_DECIMALS) : null;
    }
    if (isEth) {
      this.isEth = where;
    } else {
      if (where === this.isEth) {
        this.isEth = 0;
      }
    }
  }

  async validatePair(): Promise<void> {

    this.pairData = await this.contractService.getPairInfo(this.tokenDataFrom, this.tokenDataTo);
    if (this.pairData.addr === '0x0000000000000000000000000000000000000000') {
      // Pair does not exist
      // TODO: Translate error msg for invalid pair
      this.error = true;
      this.errorText = 'Invalid Pair';
    } else {
      if (this.pairData.reserve0.isZero() && this.pairData.reserve1.isZero()) {
        // TODO: Error message for not enough liquidity
        this.error = true;
        this.errorText = 'Not enough liquidity';
      } else {
        // Pair is valid
        this.error = false;
        this.liqProviderFee = (this.pairData.fee / 10).toString() + ' %';
        // // Show betterDealBlock
        // this.error = false;
        this.betterDealBlock = true;
      }
    }
  }

  async assignProductsToUsers(): Promise<void> {
    this.pandaSpinnerService.open();
    try {
      // Approve
      // Check that we have allowance of token. Eth does not need approve
      if (this.isEth !== 1) {
        await this.contractService.validateAllowance(this.tokenDataFrom, this.addresses.router_address, this.longInputFrom);
      }
      // Get slippage and deadline values
      const slippage = Number(localStorage.getItem('slippage'));
      // Deadline to seconds
      const deadline = Number(localStorage.getItem('transDeadLine')) * 60;
      // Make the call depending on the swap type
      let receipt;
      // Exact From A > *B or A > *ETH or ETH > *A
      if (this.tradeType === 1) {
        receipt = await this.routerService.swapExactAnyForAny(this.longInputFrom, this.longInputTo, this.tokenDataFrom,
          this.tokenDataTo, slippage, deadline, this.isEth > 0, this.wallet.recipient ? this.wallet.recipient : '0x');
      } else if (this.tradeType === 2) {
        receipt = await this.routerService.swapAnyForExactAny(this.longInputFrom, this.longInputTo, this.tokenDataFrom,
          this.tokenDataTo, slippage, deadline, this.isEth > 0, this.wallet.recipient ? this.wallet.recipient : '0x');
      }
      // Only reset amounts, keep token selections
      await this.afterOperation();
      this.alertService.success('Success');
    } catch (error) {
      this.alertService.error('Error: ' + error.message);
    } finally {
      this.pandaSpinnerService.close();
    }

  }

  async afterOperation(): Promise<void> {
    this.wallet.from = null;
    this.wallet.to = null;
    this.longInputFrom = null;
    this.longInputTo = null;
    this.minimunReceived = null;
    this.priceImpact = null;
    // Refresh Balances
    await this.setToken(1);
    await this.setToken(2);
  }



  async getPairFronPreviousSelection(list, token1, token2): Promise<void>{
      list.forEach( element1 => {
        if (element1.address === token1) {
          this.wallet.tokenFrom.name = element1.symbol;
          this.wallet.tokenFrom.icon = element1.logoURI;
          this.wallet.tokenFrom.address = element1.address;
        }
        if (element1.address === token2) {
          this.wallet.tokenTo.name = element1.symbol;
          this.wallet.tokenTo.icon = element1.logoURI;
          this.wallet.tokenTo.address = element1.address;
          // let isEth = false;
          // isEth = this.wallet.tokenTo.name === this.net && this.utilsService.compareEthAddr(this.wallet.tokenTo.address, this.addresses.weth_address);
          // this.tokenDataTo = await this.tokenService.getTokenData(this.wallet.tokenTo.address, true);
          // this.wallet.balanceTo = this.tokenDataTo ? this.tokenDataTo.balance.toFixed(SHOW_DECIMALS) : null;
          // await this.setToken(2);
        }
      });
      await this.setToken(1);
      await this.setToken(2);
      await this.validatePair();

      // If there are two tokens selected, check if the pool exist
      // const canValidatePair = this.wallet.tokenFrom.name && this.wallet.balanceFrom && this.wallet.tokenTo.name && this.wallet.balanceTo;
      // if (canValidatePair) {
      //   this.validatePair();
      // }
      // console.log('tokenFrom', this.tokenDataFrom);
      // console.log('tokenTo', this.tokenDataTo);
      // this.pairData = await this.contractService.getPairInfo(this.tokenDataFrom, this.tokenDataTo);
      // console.log('pairData', this.pairData);
      // if (this.pairData.addr === '0x0000000000000000000000000000000000000000') {
      //   // Pair does not exist
      //   // TODO: Translate error msg for invalid pair
      //   this.error = true;
      //   this.errorText = 'Invalid Pair';
      // } else {
      //   if (this.pairData.reserve0.isZero() && this.pairData.reserve1.isZero()) {
      //     // TODO: Error message for not enough liquidity
      //     this.error = true;
      //     this.errorText = 'Not enough liquidity';
      //   } else {
      //     // Pair is valid
      //     this.error = false;
      //     this.liqProviderFee = (this.pairData.fee / 10).toString() + ' %';
      //     // // Show betterDealBlock
      //     // this.error = false;
      //     this.betterDealBlock = true;
      //   }
      // }

  }

}


// Token Selection List Component Modal
@Component({
  selector: 'app-select-token',
  templateUrl: './select-token.html',
  styleUrls: ['./to-trade.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class SelectToken implements OnInit {

  wallet = [
    { symbol: '', ammount: '' }];
  dataSource;
  displayedColumns: string[] = [
    'logo',
    // 'tokenName',
    // 'ammount',
    // 'detail',
  ];

  tokens;
  selection = new SelectionModel<Token>(true, []);

  list: JSON;
  listToken = [];
  tokenList: JSON[];

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private utilsService: UtilService,
    private service: ServiceService,
    public dialogRef: MatDialogRef<Token>,
    @Inject(MAT_DIALOG_DATA) public data) {
  }

  ngOnInit(): void {
    this.getTokenList();
  }

  // Get list and order
  getTokenList(): void {
    this.service.getTokenListBamboo().subscribe((res,err) => {
      if (res){
        this.tokenList = this.utilsService.sortTokenListBySymbol(res.tokens);
        this.createTable();
      }else if (err){
        console.log(err);
      }
      });
  }

  // Table to select token
  createTable(): void {
    const data = this.tokenList;
    this.dataSource = new MatTableDataSource<any>(data);
    this.dataSource.sort = this.sort;
  }

  // Function for apply the filter in the table
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // Exit dialog
  onNoClick(): void {
    this.dialogRef.close();
  }

}
