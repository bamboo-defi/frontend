import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Pool} from 'src/app/interfaces/pool';
import {Seed} from 'src/app/interfaces/seed';
import {ServiceService} from 'src/app/services/service.service';
import {AddSeedsComponent} from '../add-seeds/add-seeds.component';
import {ConfirmComponent} from '../confirm/confirm.component';
import {HarvestComponent} from '../harvest/harvest.component';
import {TokenService} from 'src/app/services/contracts/token/token.service';
import BigNumber from 'bignumber.js';
import {ContractService} from 'src/app/services/contracts/contract.service';
import {FieldService} from 'src/app/services/contracts/field/field.service';
import {FieldUserInfo, TokenData} from 'src/app/interfaces/contracts';
import {bambooField_address} from 'src/app/services/contract-connection/tools/addresses';
import {PandaspinnerComponent} from '../pandaspinner/pandaspinner.component';
import {OwnWallet} from 'src/app/interfaces/own-wallet';
import {AlertService} from '../../_alert';

const SHOW_DECIMALS = 5;


@Component({
  selector: 'app-bamboofield',
  templateUrl: './bamboofield.component.html',
  styleUrls: ['./bamboofield.component.scss']
})
export class BamboofieldComponent implements OnInit {
  isWait = false;

  bambooRegistered: boolean;
  seeds: Seed = {
    seeds: null,
    stake: null,
    seedValue: null,
    seedsToHarvest: null,
    timeHarvest: null,
    timeWithdraw: null,
  };

  today: Date;
  couldWithdraw = false;
  stakeNew: number;
  seedsNew: number;
  newSeedsAmmount: number;
  msg: string;
  bambooData: TokenData;
  seedData: TokenData;
  registerCost: BigNumber;
  seedValue: BigNumber;
  uInfo: FieldUserInfo;
  error = false;
  pools: Pool[];
  pool: Pool;
  poolsStaked: Pool[];
  isProcessing: boolean;
  isConnect: string;
  ownWallet: OwnWallet;

  constructor(
    private service: ServiceService,
    public dialog: MatDialog,
    private tokenService: TokenService,
    private fieldService: FieldService,
    private contractService: ContractService,
    private alertService: AlertService
  ) {
  }

  ngOnInit(): void {
    this.isConnect = localStorage.getItem('connected');
    this.isWait = true;
    this.getOwnWallet(); // Get own wallet
    this.getSeeds(); // Get actual seeds
    this.getUserPools(); // Get all user pool
    this.getUserPoolsSelected(); // Get pools selected to harvest
  }

  /**
   * Gets connected wallet data
   */
  async getOwnWallet(): Promise<any> {
    this.ownWallet = await this.contractService.getOwnWallet();
  }

  /**
   * Get the initial seed position.
   */
  async getSeeds(): Promise<void> {
    if (!this.contractService.isConnection()) {
      return;
    }
    this.bambooData = await this.tokenService.getBAMBOOData();
    this.seedData = await this.tokenService.getSeedData();
    this.uInfo = await this.fieldService.getUserInfo();
    this.registerCost = await this.fieldService.getRegisterCost();

    this.today = new Date(Date.now());
    if (!this.uInfo.isActive || this.uInfo.endTime >= await this.contractService.getCurrentBlockTimestamp()) {
      this.bambooRegistered = false;
      return;
    }
    this.seedValue = await this.contractService.estimateSeedValue();
    const minStakeTime = await this.fieldService.minStakeTime();
    const tempDate = new BigNumber(this.uInfo.startTime).plus(minStakeTime);
    const timeHarv = new Date(tempDate.toNumber() * 1000);
    const seedBalance = Number(this.seedData.balance.toFixed(SHOW_DECIMALS));
    this.seeds = {
      seeds: seedBalance,
      stake: this.uInfo.amount.toFixed(SHOW_DECIMALS),
      seedValue: Number(this.seedValue.toFixed(SHOW_DECIMALS)),
      seedsToHarvest: seedBalance,
      timeHarvest: timeHarv,
      timeWithdraw: timeHarv
    };
    if (this.today >= this.seeds.timeWithdraw) {
      this.couldWithdraw = true;
    }
    this.bambooRegistered = true;
  }

  /**
   * Get all user pools, to select one at create bambooField
   */
  async getUserPools(): Promise<void> {
    this.pools = await this.contractService.getPoolList(false);
  }

  /**
   * Get user pool used to get seeds
   */
  async getUserPoolsSelected(): Promise<void> {
    this.poolsStaked = await this.contractService.getPoolList(false);
    this.isWait = false;
  }

  /**
   * Is error, you need more bamboo
   */
  isError(): void {
    if (this.stakeNew <= 2000 || !this.pool) {
      this.error = true;
    } else if (this.ownWallet.unstaked < this.stakeNew) {
      this.error = true;
    } else {
      this.error = false;
    }

  }

  /**
   * Register the first Stake
   */
  registerBamboo(): void {
    if (this.stakeNew >= 2001 && this.pool.address) {
      // Register the firs seeds amount
      this.error = false;
      this.seeds.seeds = this.stakeNew - 2000;

      this.seeds.stake = this.registerCost.toFixed(SHOW_DECIMALS);
      this.today.setDate(this.today.getDate() + 60);

      const operationData = {
        name: 'bambooField',
        seeds: this.seeds.seeds,
        stake: this.seeds.stake,
        time: this.today,
        pool: this.pool
      };

      // Confirm Dialog
      const dialogRef = this.dialog.open(ConfirmComponent, {
        width: '450px',
        data: operationData
      });
      dialogRef.afterClosed().subscribe(async (result) => {
        if (result) {
          this.bambooRegistered = true;
          return this.setNewField(this.seeds);
        } else {
          this.seeds.seeds = null;
          this.seeds.stake = null;
          await this.getSeeds();
          return this.bambooRegistered = false;
        }
      });

    } else {
      this.error = true;
      this.getSeeds();
    }
  }

  /**
   * Get more seeds when is possible
   */
  getMoreSeeds(): void {
    const seedsInitial: number = this.seeds.seeds;
    const seedsValue: BigNumber = this.seedValue;
    const dialogRef = this.dialog.open(AddSeedsComponent, {
      width: '450px',
      data: {
        seedsInitial,
        seedsValue
      }
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      const dialogPandaSpinner = this.getDialogPandaSpinner();
      try {
        if (result) {
          await this.sow(result.amount);
        }
        this.alertService.success('Success');
      } catch (error) {
        this.alertService.error('Error: ' + error.message);
      } finally {
        dialogPandaSpinner.close();
      }
    });
  }

  /**
   * Upload new seed ammunt
   */
  async sow(amount: BigNumber): Promise<void> {
    if (this.bambooRegistered) {
      await this.contractService.validateAllowance(this.seedData, bambooField_address, amount);
      const receipt = await this.fieldService.buySeeds(amount);
      await this.getSeeds();
      this.newSeedsAmmount = this.seedsNew * this.seeds.seedValue;
    }
  }

  /**
   * Harvest all possible seeds
   */
  harvest(): void {
    const operationData = {
      seedsToHarvest: this.seeds.seedsToHarvest,
      seedValue: this.seeds.seedValue
    };
    const dialogRef = this.dialog.open(HarvestComponent, {
      width: '450px',
      data: operationData
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      const dialogPandaSpinner = this.getDialogPandaSpinner();
      try {
        if (result) {
          // Approve
          const amount = new BigNumber(result.toHarvest);
          await this.contractService.validateAllowance(this.seedData, bambooField_address, amount);
          const receipt = await this.fieldService.harvestSeeds(amount);
          await this.getSeeds();

        } else {
          return;
        }
        this.alertService.success('Success');
      } catch (error) {
        this.alertService.error('Error: ' + error.message);
      } finally {
        dialogPandaSpinner.close();
      }
    });
  }

  /**
   * Withdraw all seed and the bamboo field
   */
  withdrawBamboo(): void {
    if (this.today >= this.seeds.timeWithdraw) {
      const operationData = {
        name: 'withdraw',
        seed: this.seeds.seeds,
        stake: this.seeds.stake
      };

      // Confirm Dialog
      const dialogRef = this.dialog.open(ConfirmComponent, {
        width: '450px',
        data: operationData
      });
      dialogRef.afterClosed().subscribe(async (result) => {
        if (result) {
          await this.withdraw();
        } else {
          return;
        }
      });
    }
  }

  /**
   * Create the first Field
   */
  async setNewField(seed): Promise<void> {
    const amount = this.registerCost.plus(seed.seeds);
    const dialogRef = this.getDialogPandaSpinner();
    // Approve
    try {
      await this.contractService.validateAllowance(this.bambooData, bambooField_address, amount);
      const receipt = await this.fieldService.depositBamboo(this.pool.id, amount);
      this.bambooRegistered = true;
      this.alertService.success('Success');
    } catch (error) {
      this.bambooRegistered = false;
      this.stakeNew = null;
      this.seeds.seeds = null;
      this.alertService.error('Error: ' + error.message);
    } finally {
      await this.getSeeds();
      this.isProcessing = false;
      dialogRef.close();
    }
  }

  /**
   * Withdraw Bamboos and Harvest Seeds
   */
  private async withdraw(): Promise<void> {
    const dialogRef = this.getDialogPandaSpinner();
    try {
      await this.fieldService.withdrawBamboo();
      this.seeds = {
        seeds: null,
        stake: null,
        seedValue: null,
        seedsToHarvest: null,
        timeHarvest: null,
        timeWithdraw: null,
      };
      this.bambooRegistered = false;
      this.stakeNew = null;
      this.couldWithdraw = false;
      this.pool = null;
      await this.getSeeds();
      this.alertService.success('Success');
    } catch (error) {
      this.alertService.error('Error: ' + error.message);
    } finally {
      dialogRef.close();
    }
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




