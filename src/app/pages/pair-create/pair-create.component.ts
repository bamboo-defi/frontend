import {trigger, state, style, transition, animate} from '@angular/animations';
import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatStepper} from '@angular/material/stepper';
import {UtilService} from 'src/app/services/contracts/utils/util.service';
import {ServiceService} from 'src/app/services/service.service';
import {SelectTokenComponent} from './select-token/select-token.component';
import {ConnectionService} from '../../services/contract-connection/connection.service';

import {NetworkService} from '../../services/contract-connection/network.service';
import {ContractService} from '../../services/contracts/contract.service';
import {TokenService} from '../../services/contracts/token/token.service';
import {PandaSpinnerService} from '../pandaspinner/pandaspinner.service';
const FactoryABI = require('@bamboo-defi/bamboodefi-core/build/contracts/UniswapV2Factory.json').abi;
const ERC20Abi = require('@bamboo-defi/bamboodefi-core/build/contracts/ERC20.json').abi;
import {environment} from '../../../environments/environment';
import {ConfirmComponent} from '../confirm/confirm.component';
import {RouterService} from '../../services/contracts/router/router.service';
import BigNumber from 'bignumber.js';
import {AlertService} from '../../_alert';

@Component({
  selector: 'app-pair-create',
  templateUrl: './pair-create.component.html',
  styleUrls: ['./pair-create.component.scss'],
  animations: [
    trigger('detailExpand', [
      state(
        'collapsed',
        style({
          height: '0px',
          minHeight: '0',
        })
      ),
      state(
        'expanded',
        style({
          height: '*',
        })
      ),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class PairCreateComponent implements OnInit {

  tokenDataFirst = {
    balance: null,
    addr: null,
    decimals: 18,
    isEth: null,
    symbol: null,
    logoURI: null
  };
  tokenDataSecond = {
    balance: null,
    addr: null,
    decimals: 18,
    isEth: null,
    symbol: null,
    logoURI: null
  };
  token1Supply = null;
  token2Supply = null;

  tokenList: JSON[];

  error = false;
  error2 = false;
  error3 = false;
  error31 = false;
  errorText: string;
  errorText2: string;
  errorText3 = 'create-pair.supplyBalanceError';
  errorText31: string;
  logoDef = 'assets/question.png';

  isConnected = false;
  addresses;

  pairValidated = false;
  token1Approved = false;
  token2Approved = false;

  @ViewChild('stepper') stepper: MatStepper;

  constructor(
    private service: ServiceService,
    private utilsService: UtilService,
    public dialog: MatDialog,
    public connService: ConnectionService,
    private networkService: NetworkService,
    private contractService: ContractService,
    private tokenService: TokenService,
    private pandaSpinnerService: PandaSpinnerService,
    private routerService: RouterService,
    private alertService: AlertService,
  ) {
    this.addresses = networkService.getAddressNetwork();
  }

  ngOnInit(): void {
    this.isConnected = this.connService.provider !== undefined;
    if (this.isConnected) {
      this.getTokenList();
    }
  }

  /**
   * Get tokens listed on bamboodefi
   */
  getTokenList(): void {
    this.service.getTokenListBamboo().subscribe(
      res => {
        this.tokenList = this.utilsService.sortTokenListBySymbol(res.tokens);
      });
  }

  /**
   * Selects token first or second with 3 possible cases each
   * - If it has no data returns error
   * - If only has address finds its data
   * - if it is complete it uses its data
   */
  openTokenList(input): void {
    const tokenList = this.tokenList;
    const dialogRef = this.dialog.open(SelectTokenComponent, {
      width: '450px',
      data: {
        tokenList
      }
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result !== undefined) {
        if (input === 1) {
          // If repeat the token
          if (result.symbol === this.tokenDataSecond.symbol || result === this.tokenDataSecond.addr) {
            this.error = true;
            this.errorText = 'create-pair.sameTokenError';
            this.tokenDataFirst.addr = null;
            this.tokenDataFirst.symbol = null;
            this.tokenDataFirst.logoURI = null;
            this.tokenDataFirst.isEth = null;
            this.tokenDataFirst.decimals = null;
            this.tokenDataFirst.balance = null;
          } else if (!result.address) {
            this.error = false;
            this.tokenDataFirst.addr = result;
            this.tokenDataFirst.logoURI = this.logoDef;
            this.setTokenPair(1);
          } else {
            this.error = false;
            this.tokenDataFirst.addr = result.address;
            this.tokenDataFirst.symbol = result.symbol;
            this.tokenDataFirst.logoURI = result.logoURI ? result.logoURI : this.logoDef;
            this.tokenDataFirst.isEth = this.tokenDataFirst.symbol === environment.net;
            this.tokenDataFirst.decimals = parseInt(result.decimals, 10);
            this.tokenDataFirst.balance = null;
          }
        }
        else if (input === 2) {
          // If repeat the token
          if (result.symbol === this.tokenDataFirst.symbol || result === this.tokenDataFirst.addr) {
            this.error = true;
            this.errorText = 'create-pair.sameTokenError';
            this.tokenDataSecond.addr = null;
            this.tokenDataSecond.symbol = null;
            this.tokenDataSecond.logoURI = null;
            this.tokenDataSecond.isEth = null;
            this.tokenDataSecond.decimals = null;
            this.tokenDataSecond.balance = null;
          } else if (!result.address) {
            this.error = false;
            this.tokenDataSecond.addr = result;
            this.tokenDataSecond.logoURI = this.logoDef;
            this.setTokenPair(2);
          } else {
            this.error = false;
            this.tokenDataSecond.addr = result.address;
            this.tokenDataSecond.symbol = result.symbol;
            this.tokenDataSecond.logoURI = result.logoURI ? result.logoURI : this.logoDef;
            this.tokenDataSecond.isEth = this.tokenDataSecond.symbol === environment.net;
            this.tokenDataSecond.decimals = parseInt(result.decimals, 10);
            this.tokenDataSecond.balance = null;
          }
        }
        this.stepper.reset();
        this.pairValidated = false;
        // If there are two tokens selected, check if the pool exist
        if (this.tokenDataFirst.addr && this.tokenDataSecond.addr) {
          await this.validatePair();
        }
      }
    });
  }

  /**
   * Search for token name by address
   */
  async setTokenPair(input): Promise<void> {
    if (input === 1) {
      const token = new this.connService.web3js.eth.Contract(ERC20Abi, this.tokenDataFirst.addr);
      this.tokenDataFirst.symbol = await token.methods.symbol().call({from: this.connService.accounts[0]});
      this.tokenDataFirst.isEth = this.tokenDataFirst.symbol === environment.net;
      this.tokenDataFirst.decimals = parseInt(await token.methods.decimals().call({from: this.connService.accounts[0]}), 10);
      this.tokenDataFirst.balance = null;
    } else if (input === 2) {
      const token = new this.connService.web3js.eth.Contract(ERC20Abi, this.tokenDataSecond.addr);
      this.tokenDataSecond.symbol = await token.methods.symbol().call({from: this.connService.accounts[0]});
      this.tokenDataSecond.isEth = this.tokenDataSecond.symbol === environment.net;
      this.tokenDataSecond.decimals = parseInt(await token.methods.decimals().call({from: this.connService.accounts[0]}), 10);
      this.tokenDataSecond.balance = null;
    }
  }

  /**
   * Validates if Tokens has a Pair created, if correct, goes to next step
   */
  async validatePair(): Promise<void> {
    this.pandaSpinnerService.open();
    const factory = new this.connService.web3js.eth.Contract(FactoryABI, this.addresses.factory_address);
    const pairAddress = await factory.methods.getPair(this.tokenDataFirst.addr, this.tokenDataSecond.addr)
      .call({from: this.connService.accounts[0]});
    this.pandaSpinnerService.close();
    if (pairAddress !== this.addresses.zero_address) {
      this.error = true;
      this.errorText = 'create-pair.pairExistError';
      this.pairValidated = false;
    } else {
      this.pairValidated = true;
      this.stepper.selectedIndex = 1;
    }
  }

  /**
   * Check if tokens needs to approve allowance, if correct, goes to next step
   */
  async checkApprove(): Promise<void> {
    this.error2 = false;
    this.pandaSpinnerService.open();
    this.tokenDataFirst.balance = (await this.tokenService.getTokenData(
      this.tokenDataFirst.addr, this.tokenDataFirst.symbol === environment.net)).balance;
    const allowance1 = this.utilsService.fromWeiToBN(
      await this.tokenService.getAllowance(this.tokenDataFirst.addr, this.addresses.router_address), this.tokenDataFirst.decimals);
    this.tokenDataSecond.balance = (await this.tokenService.getTokenData(
      this.tokenDataSecond.addr, this.tokenDataSecond.symbol === environment.net)).balance;
    const allowance2 = this.utilsService.fromWeiToBN(
      await this.tokenService.getAllowance(this.tokenDataSecond.addr, this.addresses.router_address), this.tokenDataSecond.decimals);
    this.token1Approved = this.utilsService.fromBNtoNumber(allowance1) > 0;
    this.token2Approved = this.utilsService.fromBNtoNumber(allowance2) > 0;
    this.pandaSpinnerService.close();
    if (this.token1Approved && this.token2Approved){
      this.stepper.selectedIndex = 2;
    }
  }

  /**
   * Approves token for using in the router
   * @param input * the token position
   * @param tokenData * token data
   */
  async approve(input, tokenData): Promise<void> {
    this.pandaSpinnerService.open();
    try{
      const receipt = await this.tokenService.approve(tokenData, this.addresses.router_address);
      if (receipt.status) {
        if (input === 1) {
          this.token1Approved = true;
        } else if (input === 2) {
          this.token2Approved = true;
        }
        this.error2 = false;
      }
    } catch (error) {
      this.error2 = true;
      this.errorText2 = 'create-pair.approveTokenError';
    } finally {
      this.pandaSpinnerService.close();
    }
  }

  async submitAmounts(): Promise<void> {
    if (await this.checkThirdStep()) {
      const operationData = {
        name: 'createPair',
        pair: {
          supply1: this.token1Supply,
          supply2: this.token2Supply,
          logo1: this.tokenDataFirst.logoURI,
          logo2: this.tokenDataSecond.logoURI,
          symbol1: this.tokenDataFirst.symbol,
          symbol2: this.tokenDataSecond.symbol,
        }
      };

      // Confirm Dialog
      const dialogRef = this.dialog.open(ConfirmComponent, {
        width: '450px',
        data: operationData
      });
      dialogRef.afterClosed().subscribe(async (result) => {
        if (result) {
          await this.addLiquidity();
        } else {
          return;
        }

      });
    }
  }

  async addLiquidity(): Promise<void> {
    this.pandaSpinnerService.open();
    try {
      // Deadline to seconds
      const deadline = Number(localStorage.getItem('transDeadLine')) * 60;
      const slippage = 0;
      this.service.createPair(this.tokenDataFirst.addr, this.tokenDataSecond.addr);
      const receipt = await this.routerService.addLiquidityAny(this.tokenDataFirst, this.tokenDataSecond,
        new BigNumber(parseFloat(this.token1Supply)), new BigNumber(parseFloat(this.token2Supply)),
        slippage, deadline, this.tokenDataFirst.isEth || this.tokenDataSecond.isEth);
      this.emptyForms();
      this.stepper.reset();
      this.error3 = false;
      this.error31 = false;
      this.alertService.success('Success');
    } catch (error) {
      this.errorText31 = error.message;
      this.error31 = true;
      this.alertService.error('Error: ' + error.message);
    } finally {
      this.pandaSpinnerService.close();
    }
  }

  /**
   * Checks if first step form is correctly filled
   */
  async checkFirstStep(check = true): Promise<boolean> {
    if (this.tokenDataFirst.addr === null || this.tokenDataSecond.addr === null || this.error ||
        !this.pairValidated || !this.isConnected){
      if (!this.isConnected){
        this.error = true;
        this.errorText = 'create-pair.connectWalletError';
      } else if (!this.error && (this.tokenDataFirst.addr === null || this.tokenDataSecond.addr === null)) {
        this.error = true;
        this.errorText = 'create-pair.selectTokensError';
      } else if (!this.error && !this.pairValidated) {
        this.error = true;
        this.errorText = 'create-pair.waitValidationError';
      }
      await this.delay(200);
      this.stepper.selectedIndex = 0;
      this.stepper.reset();
      this.emptyForm2();
      return false;
    } else {
      if (check) {
        this.checkApprove();
      }
      return true;
    }
  }

  /**
   * Checks if second step form is correctly filled
   */
  async checkSecondStep(): Promise<boolean> {
    if (await this.checkFirstStep(false)) {
      if (!this.token1Approved || !this.token2Approved) {
        this.error2 = true;
        this.errorText2 = 'create-pair.notApprovedError';
        await this.delay(200);
        this.stepper.selectedIndex = 1;
        this.emptyForm3();
        return false;
      } else {
        return true;
      }
    }
  }

  /**
   * Checks if third step form is correctly filled
   */
  async checkThirdStep(): Promise<boolean> {
    if (this.token1Supply > this.tokenDataFirst.balance || this.token2Supply > this.tokenDataSecond.balance) {
      this.error3 = true;
      this.errorText3 = 'create-pair.supplyBalanceError';
      return false;
    } else {
      return true;
    }
  }

  /**
   * When mat-step changes position
   */
  onStepChange(event: any): void {
    if (event.selectedIndex === 1 && event.previouslySelectedIndex === 0) {
      this.checkFirstStep();
    } else if (event.selectedIndex === 2) {
      this.checkSecondStep();
    }
  }

  /**
   * Delay in microseconds
   */
  delay(ms: number): Promise<void> {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  /**
   * Clears data filled in form1
   */
  emptyForm1(): void {
    this.tokenDataFirst = {
      balance: null,
      addr: null,
      decimals: 18,
      isEth: null,
      symbol: null,
      logoURI: null
    };
    this.tokenDataSecond = {
      balance: null,
      addr: null,
      decimals: 18,
      isEth: null,
      symbol: null,
      logoURI: null
    };
    this.pairValidated = false;
    this.error = false;
  }

  /**
   * Clears data filled in form2
   */
  emptyForm2(): void {
    this.token1Approved = false;
    this.token2Approved = false;
    this.error2 = false;
  }

  /**
   * Clears data filled in form3
   */
  emptyForm3(): void {
    this.token1Supply = null;
    this.token2Supply = null;
    this.error3 = false;
    this.error31 = false;
  }

  /**
   * Clears data filled in all the forms
   */
  emptyForms(): void {
    this.emptyForm1();
    this.emptyForm2();
    this.emptyForm3();
  }

}
