import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import BigNumber from 'bignumber.js';
import { FieldUserInfo, TokenData } from 'src/app/interfaces/contracts';
import { Pool } from 'src/app/interfaces/pool';
import { Seed } from 'src/app/interfaces/seed';
import { NetworkService } from 'src/app/services/contract-connection/network.service';
import { ContractService } from 'src/app/services/contracts/contract.service';
import { FieldService } from 'src/app/services/contracts/field/field.service';
import { TokenService } from 'src/app/services/contracts/token/token.service';
import { AlertService } from 'src/app/_alert';
import { AddSeedsComponent } from '../../add-seeds/add-seeds.component';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { HarvestComponent } from '../../harvest/harvest.component';
import { PandaSpinnerService } from '../../pandaspinner/pandaspinner.service';

const SHOW_DECIMALS = 5;

@Component({
  selector: 'app-active-field',
  templateUrl: './active-field.component.html',
  styleUrls: ['./active-field.component.scss']
})
export class ActiveFieldComponent implements OnInit {

  seeds: Seed = {
    seeds: null,
    stake: null,
    seedValue: null,
    seedsToHarvest: null,
    timeHarvest: null,
    timeWithdraw: null,
  };

  seedValue: BigNumber;
  bambooRegistered: boolean;
  seedData: TokenData;
  today: Date;
  couldWithdraw = false;
  stakeNew: number;
  seedsNew: number;
  newSeedsAmmount: number;
  bambooData: TokenData;
  registerCost: BigNumber;
  uInfo: FieldUserInfo;
  error = false;
  pool: Pool;
  addresses;


  constructor(
    public dialog: MatDialog,
    private tokenService: TokenService,
    private fieldService: FieldService,
    private contractService: ContractService,
    private alertService: AlertService,
    private pandaSpinnerService: PandaSpinnerService,
    private networkService: NetworkService

  ) {
    this.addresses = networkService.getAddressNetwork();

  }

  ngOnInit(): void {
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
      this.pandaSpinnerService.open();
      try {
        if (result) {
          await this.sow(result.amount);
        }
        this.alertService.success('Success');
      } catch (error) {
        this.alertService.error('Error: ' + error.message);
      } finally {
        this.pandaSpinnerService.close();
      }
    });
  }

  /**
   * Upload new seed ammunt
   */
   async sow(amount: BigNumber): Promise<void> {
    if (this.bambooRegistered) {
      await this.contractService.validateAllowance(this.seedData, this.addresses.bambooField_address, amount);
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
      this.pandaSpinnerService.open();
      try {
        if (result) {
          // Approve
          const amount = new BigNumber(result.toHarvest);
          await this.contractService.validateAllowance(this.seedData, this.addresses.bambooField_address, amount);
          const receipt = await this.fieldService.harvestSeeds(amount);
          await this.getSeeds();

        } else {
          return;
        }
        this.alertService.success('Success');
      } catch (error) {
        this.alertService.error('Error: ' + error.message);
      } finally {
        this.pandaSpinnerService.close();
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
   * Withdraw Bamboos and Harvest Seeds
   */
   private async withdraw(): Promise<void> {
    this.pandaSpinnerService.open();
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
      this.pandaSpinnerService.close();
    }
  }
}
