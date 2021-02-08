import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {LiquidityPlus} from 'src/app/interfaces/liquidity-plus';
import {Token} from 'src/app/interfaces/token';
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
import {router_address, weth_address} from 'src/app/services/contract-connection/tools/addresses';
import {PandaspinnerComponent} from '../../pandaspinner/pandaspinner.component';
import {AlertService} from '../../../_alert';

const SHOW_DECIMALS = 5;
const TOKEN_1 = 1;
const TOKEN_2 = 2;

@Component({
  selector: 'app-liquidity-plus',
  templateUrl: './liquidity-plus.component.html',
  styleUrls: ['./liquidity-plus.component.scss']
})
export class LiquidityPlusComponent implements OnInit {

  liquidityPlus: LiquidityPlus = {
    inputFirst: null,
    inputSecond: null,
    firstPerSecond: '0',
    secondPerFirst: '0',
    shareOfPool: '0',
    tokenFirst: {
      icon: '',
      name: '',
      addr: '',
    },
    tokenSecond: {
      icon: '',
      name: '',
      addr: '',
    },
    inputBalanceFirst: '0',
    inputBalanceSecond: '0',
    position: '0',
    positionFirst: '0',
    positionSecond: '0',
  };

  tokens: Token[] = [
    {
      name: 'Etherum',
      abrv: 'ETH',
      icon: 'Icono ETH'
    },
    {
      name: 'DAI',
      abrv: 'DAI',
      icon: 'Icono DAI'
    }
  ];

  // tokenFirst: Token;
  // tokenSecond: Token;

  tokenList: JSON;
  tokenLogo = environment.tokenLogo;

  // 0 is false, 1 is tokenFirst, 2 is tokenSecond
  isEth = 0;

  pairData: PairData;
  tokenDataFirst: TokenData;
  tokenDataSecond: TokenData;
  longInputFirst: BigNumber;
  longInputSecond: BigNumber;

  error: boolean;
  errorText: string;
  firstPool = false;

  constructor(
    private service: ServiceService,
    public dialog: MatDialog,
    private tokenService: TokenService,
    private routerService: RouterService,
    private utilsService: UtilService,
    private pairService: PairService,
    private contractService: ContractService,
    private alertService: AlertService
  ) {
  }

  ngOnInit(): void {
    this.getTokenList();
  }

  // Get token list from service
  getTokenList(): void {
    this.service.getTokenList().subscribe(
      res => {
        const obj = res.tokens;
        obj.push({
          chainId: 1,
          address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
          name: 'Wrapped Bitcoin',
          symbol: 'WBTC',
          decimals: 8
        });
        obj.reverse();
        this.tokenList = obj;
      });
  }

  async setValues(where: number): Promise<void> {

    let input: BigNumber;
    if (where === 1 && this.utilsService.validateInput(this.liquidityPlus.inputFirst) && this.tokenDataFirst) {
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

  selectFirstTokenFromList(): void {
    return this.openTokenList(TOKEN_1);
  }

  selectSecondTokenFromList(): void {
    return this.openTokenList(TOKEN_2);
  }

  // Open dialog to select token from previous list
  openTokenList(input): void {
    const tokenList = this.tokenList;
    const dialogRef = this.dialog.open(SelectToken, {
      width: '450px',
      data: {
        tokenList
      }
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (input === TOKEN_1) {
        if (result.symbol === this.liquidityPlus.tokenSecond.name) {
          this.error = true;
          this.errorText = 'to-stake.errorTextToken';
          return;
        }
        this.error = false;
        this.liquidityPlus.tokenFirst.name = result.symbol;
        this.liquidityPlus.tokenFirst.icon = result.logoURI;
        this.liquidityPlus.tokenFirst.addr = result.address;
        await this.setToken(TOKEN_1);
      }
      if (input === TOKEN_2) {
        if (result.symbol === this.liquidityPlus.tokenFirst.name) {
          this.error = true;
          this.errorText = 'to-stake.errorTextToken';
          return;
        }
        this.error = false;
        this.liquidityPlus.tokenSecond.name = result.symbol;
        this.liquidityPlus.tokenSecond.icon = result.logoURI;
        this.liquidityPlus.tokenSecond.addr = result.address;
        await this.setToken(TOKEN_2);
      }

      // If there are two tokens selected, check if the pool exist
      if (this.liquidityPlus.tokenFirst.name && this.liquidityPlus.tokenSecond.name) {
        await this.validatePair();
      }
    });
  }

  async setToken(where: number): Promise<void> {
    let isEth = false;
    if (where === TOKEN_1) {
      isEth = this.liquidityPlus.tokenFirst.name === 'ETH' && this.utilsService.compareEthAddr(this.liquidityPlus.tokenFirst.addr, weth_address);
      this.tokenDataFirst = await this.tokenService.getTokenData(this.liquidityPlus.tokenFirst.addr, isEth);
      this.liquidityPlus.inputBalanceFirst = this.tokenDataFirst.balance.toFixed(SHOW_DECIMALS);
    } else if (where === TOKEN_2) {
      isEth = this.liquidityPlus.tokenSecond.name === 'ETH' && this.utilsService.compareEthAddr(this.liquidityPlus.tokenSecond.addr, weth_address);
      this.tokenDataSecond = await this.tokenService.getTokenData(this.liquidityPlus.tokenSecond.addr, isEth);
      this.liquidityPlus.inputBalanceSecond = this.tokenDataSecond.balance.toFixed(SHOW_DECIMALS);
    }
    if (isEth) {
      this.isEth = where;
    } else {
      if (where === this.isEth) {
        this.isEth = 0;
      }
    }
  }

  // Merged with firstPoolActive()
  async validatePair(): Promise<void> {
    this.pairData = await this.contractService.getPairInfo(this.tokenDataFirst, this.tokenDataSecond);
    if (this.pairData.addr === '0x0000000000000000000000000000000000000000') {
      // TODO: Translate error msg for invalid pair
      this.error = true;
      this.errorText = 'Invalid Pair';
    } else {
      this.error = false;
      if (this.pairData.reserve0.isZero() && this.pairData.reserve1.isZero()) {
        // First Time adding liquidity
        this.firstPool = true;
        this.liquidityPlus.firstPerSecond = '-';
        this.liquidityPlus.secondPerFirst = '-';
        this.liquidityPlus.shareOfPool = '0 %';
      } else {
        this.firstPool = false;
        const AperB = this.utilsService.getOtherAmountOfPair(new BigNumber(1), this.tokenDataSecond.addr, this.pairData);
        const BperA = this.utilsService.getOtherAmountOfPair(new BigNumber(1), this.tokenDataFirst.addr, this.pairData);
        this.liquidityPlus.firstPerSecond = AperB.toFixed(this.tokenDataSecond.decimals);
        this.liquidityPlus.secondPerFirst = BperA.toFixed(this.tokenDataFirst.decimals);
        this.liquidityPlus.shareOfPool = (await this.pairService.getOwnership(this.pairData.addr)).times(100).toFixed(3) + ' %';
        this.liquidityPlus.position = this.utilsService.fromWeiToBN(await this.tokenService.getBalance(this.pairData.addr))
          .toFixed(SHOW_DECIMALS);
        // Swap if tokens are out of order
        let reserve0 = this.pairData.reserve0;
        let reserve1 = this.pairData.reserve1;
        if (this.pairData.token0 === this.liquidityPlus.tokenSecond.addr) {
          reserve0 = this.pairData.reserve1;
          reserve1 = this.pairData.reserve0;
        }
        this.liquidityPlus.positionFirst = reserve0.toFixed(SHOW_DECIMALS);
        this.liquidityPlus.positionSecond = reserve1.toFixed(SHOW_DECIMALS);
      }
    }
  }

  // Submit form, open dialog
  submit(): void {
    if (!this.liquidityPlus.tokenFirst.name || !this.liquidityPlus.tokenSecond.name) {
      this.error = true;
      this.errorText = 'liquidityPlus.errorTextToken';
      return;
    }

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
        await this.assignProductsToUsers();
      } else {
        return;
      }

    });
  }

  // Confirm, need service
  async assignProductsToUsers(): Promise<void> {
    const dialogPandaSpinner = this.getDialogPandaSpinner();
    try {
      // Approve
      // Check that we have allowance of token. If isEth is 1, ETH is token first.
      if (this.isEth !== TOKEN_1) {
        await this.contractService.validateAllowance(this.tokenDataFirst, router_address, this.longInputFirst);
      }
      if (this.isEth !== TOKEN_2) {
        await this.contractService.validateAllowance(this.tokenDataSecond, router_address, this.longInputSecond);
      }
      // Get slippage and deadline values
      let slippage = Number(localStorage.getItem('slippage'));
      // Deadline to seconds
      const deadline = Number(localStorage.getItem('transDeadLine')) * 60;
      if (this.firstPool) {
        slippage = 0;
      }
      const receipt = await this.routerService.addLiquidityAny(this.tokenDataFirst, this.tokenDataSecond,
        this.longInputFirst, this.longInputSecond, slippage, deadline, this.isEth > 0);

      // Only reset amounts, keep token selections
      await this.afterOperation();
      this.alertService.success('Success');
    } catch (error) {
      this.alertService.error('Error: ' + error.message);
    } finally {
      dialogPandaSpinner.close();
    }
  }

  async afterOperation(): Promise<void> {
    this.liquidityPlus.inputFirst = null;
    this.liquidityPlus.inputSecond = null;
    this.longInputFirst = null;
    this.longInputSecond = null;
    // Refresh balances
    await this.setToken(TOKEN_1);
    await this.setToken(TOKEN_2);
    // Refresh reserves and position
    await this.validatePair();
  }

  /**
   * PandaSpinner Dialog
   */
  private getDialogPandaSpinner(): any {
    return this.dialog.open(PandaspinnerComponent, {
      closeOnNavigation: false,
      disableClose: true,
      panelClass: 'panda-spinner'
    });
  }
}
