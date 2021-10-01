import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import BigNumber from 'bignumber.js';
import { LiquidityValue, PairData, TokenData } from 'src/app/interfaces/contracts';
import { Pair } from 'src/app/interfaces/pair';
import { Pool } from 'src/app/interfaces/pool';
import { NetworkService } from 'src/app/services/contract-connection/network.service';
import { ContractService } from 'src/app/services/contracts/contract.service';
import { PairService } from 'src/app/services/contracts/pair/pair.service';
import { RouterService } from 'src/app/services/contracts/router/router.service';
import { TokenService } from 'src/app/services/contracts/token/token.service';
import { UtilService } from 'src/app/services/contracts/utils/util.service';
import { AlertService } from 'src/app/_alert';
import {environment} from 'src/environments/environment';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { PandaSpinnerService } from '../../pandaspinner/pandaspinner.service';
const BLP_DECIMALS = 18;
const SHOW_DECIMALS = 5;

@Component({
  selector: 'app-minus-liquidity-pair',
  templateUrl: './minus-liquidity-pair.component.html',
  styleUrls: ['./minus-liquidity-pair.component.scss']
})
export class MinusLiquidityPairComponent implements OnChanges {

  net: string = environment.net;

  errorNoPool = false;
  tokenEqual = false;
  liquidTool = false;
  liquidityData: TokenData;

  tokenDataFirst: TokenData;
  tokenDataSecond: TokenData;
  pool: Pool;
  pairData: PairData;
  liquidityAmount: BigNumber;
  ammountPercentaje = 0;
  liquidityEstimate: LiquidityValue;

  percents: number[] = [25, 50, 75, 100];

  reward: {
    tokenFirst: string,
    tokenSecond: string
  };

  ammountBalance: number;
  addresses;
  isEth = false;

  @Input() pairSelected: Pool;

  constructor(
    private tokenService: TokenService,
    private pairService: PairService,
    private utilsService: UtilService,
    public dialog: MatDialog,
    private networkService: NetworkService,
    private pandaSpinnerService: PandaSpinnerService,
    private contractService: ContractService,
    private routerService: RouterService,
    private alertService: AlertService
  ) {
    this.liquidityAmount = new BigNumber(0);
    this.addresses = networkService.getAddressNetwork();
   }

  // ngOnInit(): void {
  //   this.getSelectedPair(this.pairSelected);
  //   this.reward = {
  //     tokenFirst: '0',
  //     tokenSecond: '0'
  //   };
  // }

  ngOnChanges(): void{
    this.getSelectedPair(this.pairSelected);
    this.reward = {
      tokenFirst: '0',
      tokenSecond: '0'
    };
  }

  async getSelectedPair(pair): Promise<void> {
    this.pool = {
      id: 'idPool1',
      logo: 'string',
      title: 'Bamboo grow!',
      pair: pair.pairTokenNameFirst + '/' + pair.pairTokenNameSecond,
      address: pair.pairAddress,
      logoTokenFirst: pair.logoTokenFirst,
      logoTokenSecond: pair.logoTokenSecond,
      addressTokenFirst: pair.addressTokenFirst,
      addressTokenSecond: pair.addressTokenSecond,
      underlyingToken: null,
      underlyingTokenFirst: pair.pairTokenNameFirst,
      underlyingTokenSecond: pair.pairTokenNameSecond,
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
      reward: Number(pair.liquidityData.balance.toFixed(pair.liquidityData.decimals)),
      isActive: true,
      isLoading: true,
      bambooPrice: null,
      isExcludedFromBambooPrice: null,
      roiYCompound: null
    };
    this.tokenDataFirst = await this.tokenService.getTokenData(pair.addressTokenFirst,
      pair.pairTokenNameFirst === this.net && pair.addressTokenFirst === this.addresses.weth_address);
    this.tokenDataSecond = await this.tokenService.getTokenData(pair.addressTokenSecond,
      pair.pairTokenNameSecond === this.net && pair.addressTokenSecond === this.addresses.weth_address);
    this.liquidityData = pair.liquidityData;
    this.pairData = pair.pairData;
    this.liquidTool = true;
    await this.setRewards();
  }

  // Percentage change event return amount
  async setRewards(): Promise<void> {
    // Modify liquidity amount
    const amount = new BigNumber(this.ammountPercentaje / 100);
    this.liquidityAmount = this.liquidityData.balance.multipliedBy(amount);
    // Estimate the value of liquidity
    this.liquidityEstimate = await this.pairService.estimateLiquidityValue(this.pairData.addr, this.tokenDataFirst,
      this.tokenDataSecond, this.liquidityAmount);
    // Check if token order was not inverted
    let estimateA = this.liquidityEstimate.amountA;
    let estimateB = this.liquidityEstimate.amountB;
    if (!this.utilsService.compareEthAddr(this.liquidityEstimate.tokenA.addr, this.tokenDataFirst.addr)) {
      estimateA = this.liquidityEstimate.amountB;
      estimateB = this.liquidityEstimate.amountA;
    }
    this.reward.tokenFirst = estimateA.toFixed(SHOW_DECIMALS);
    this.reward.tokenSecond = estimateB.toFixed(SHOW_DECIMALS);
    this.ammountBalance = Number(this.liquidityAmount.toFixed(BLP_DECIMALS));
  }

    // Returns the percentage to subtract from liquidity
    async setPercent(percent): Promise<void> {
      this.ammountPercentaje = percent;
      await this.setRewards();
    }

    // If +100% returns 100
    maxCien(): number {
      if (this.ammountPercentaje >= 100) {
        this.ammountPercentaje = 100;
        this.ammountBalance = this.ammountPercentaje * this.pool.reward;
        return this.ammountPercentaje;
      }
      this.ammountBalance = this.ammountPercentaje * this.pool.reward / 100;
      return this.ammountBalance;

    }

    onSubmit(): void {

      // Operation Data
      const operationData = {
        name: 'liquidityMinus',
        ammount: this.liquidityAmount.toFixed(SHOW_DECIMALS),
        pool: this.pool,
        reward: this.reward
      };

      // Confirm Dialog
      const dialogRef = this.dialog.open(ConfirmComponent, {
        width: '450px',
        data: operationData
      });
      dialogRef.afterClosed().subscribe(async (result) => {
        if (result) {
          await this.liquidityMinusSelectedPool();
        } else {
          return;
        }
      });
    }

    // Confirmed, need service
  async liquidityMinusSelectedPool(): Promise<void> {
    this.pandaSpinnerService.open();
    try {
      // Approve liquidity if needed
      await this.contractService.validateAllowance(this.liquidityData, this.addresses.router_address, this.liquidityAmount);

      // Get slippage and deadline values
      const slippage = Number(localStorage.getItem('slippage'));
      // Deadline to seconds
      const deadline = Number(localStorage.getItem('transDeadLine')) * 60;

      // Remove Liquidity
      await this.routerService.removeLiquidityAny(this.pairData.addr, this.liquidityAmount, slippage,
        deadline, this.liquidityEstimate, this.isEth);

      // Reset pool balance
      this.liquidityData = await this.tokenService.getTokenData(this.pairData.addr, false);
      this.ammountPercentaje = 0;
      this.pool.reward = Number(this.liquidityData.balance.toFixed(BLP_DECIMALS));
      await this.setRewards();
      this.alertService.success('Success');
    } catch (error) {
      this.alertService.error('Error: ' + error.message);
    } finally {
      this.pandaSpinnerService.close();
    }
  }

    // Amount onchange
    async maxBalance(): Promise<void> {
      if (this.ammountBalance < Number(this.liquidityData.balance.toString())) {
        this.ammountPercentaje = this.ammountBalance * 100 / this.pool.reward;
        await this.setRewards();
      } else {
        this.ammountPercentaje = 100;
        this.ammountBalance = this.pool.reward;
        await this.setRewards();
      }
    }


}
