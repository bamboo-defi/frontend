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
import {NetworkService} from 'src/app/services/contract-connection/network.service';
import {PandaspinnerComponent} from '../pandaspinner/pandaspinner.component';
import {OwnWallet} from 'src/app/interfaces/own-wallet';
import {AlertService} from '../../_alert';
import { PandaSpinnerService } from '../pandaspinner/pandaspinner.service';
import { ConnectionService } from 'src/app/services/contract-connection/connection.service';
import { KeeperService } from 'src/app/services/contracts/keeper/keeper.service';
import { MatTableDataSource } from '@angular/material/table';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

const SHOW_DECIMALS = 18 ;


@Component({
  selector: 'app-bamboofield',
  templateUrl: './bamboofield.component.html',
  styleUrls: ['./bamboofield.component.scss']
})
export class BamboofieldComponent implements OnInit {

  addresses;

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
  pools: Pool[] = [];
  pool: Pool;
  poolsStaked: Pool[];
  isProcessing: boolean;
  isConnect: string;
  ownWallet: OwnWallet;
  poolsActives: Pool[];
  dataSource = new MatTableDataSource<Pool>();
  displayedColumns: string[];
  poolSelected: Pool;
  selected = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'determinate';
  value: number;

  constructor(
    private service: ServiceService,
    public dialog: MatDialog,
    private tokenService: TokenService,
    private fieldService: FieldService,
    private contractService: ContractService,
    private alertService: AlertService,
    private pandaSpinnerService: PandaSpinnerService,
    private networkService: NetworkService,
    public connService: ConnectionService,
    private keeperService: KeeperService,

  ) {
    this.addresses = networkService.getAddressNetwork();
  }

  ngOnInit(): void {
    this.isConnect = localStorage.getItem('connected');
    this.isWait = true;
    this.getOwnWallet(); // Get own wallet
    this.getSeeds(); // Get actual seeds
    this.getUserPools(); // Get all user pool
    // this.getUserPoolsSelected(); // Get pools selected to harvest

    // setInterval(async () => {
    //   if (this.connService.provider !== undefined) {
    //     this.pools.forEach(async pool => {
    //       pool.reward = Number((await this.keeperService.getPendingBAMBOO(pool.id)).toFixed(SHOW_DECIMALS));
    //     });
    //   }
    // }, 30000);
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
    console.log('seedData', this.seedData);

    this.uInfo = await this.fieldService.getUserInfo();
    console.log('uinfo', this.uInfo);
    this.registerCost = await this.fieldService.getRegisterCost();
    this.today = new Date(Date.now());
    if (!this.uInfo.isActive || this.uInfo.endTime >= await this.contractService.getCurrentBlockTimestamp()) {
      this.bambooRegistered = false;
      return;
    }
    this.seedValue = await this.contractService.estimateSeedValue();
    const minStakeTime = await this.fieldService.minStakeTime();
    console.log('minStakeTime', minStakeTime);
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

    // Fecha salida
    const salida = tempDate.toNumber() * 1000;
    console.log('salida', salida);
    // Fecha arranque
    console.log('arranque', this.uInfo.startTime * 1000);
    const entrada = this.uInfo.startTime * 1000;
    // Today
    console.log('hoy', Date.now());
    // Porcentaje
    console.log('porcentaje', ((Date.now() - entrada) / (salida - entrada)) * 100 );
    this.value = ((Date.now() - entrada) / (salida - entrada)) * 100 ;


    if (this.today >= this.seeds.timeWithdraw) {
      this.couldWithdraw = true;
    }
    this.bambooRegistered = true;
  }

  /**
   * Get all user pools and show a table
   */
  async getUserPools(): Promise<any> {
    this.displayedColumns = [
      'title'
    ];
    this.pools = await this.contractService.getPoolList();
    this.dataSource = new MatTableDataSource<Pool>(this.pools);
    this.isWait = false;
    if (this.connService.provider !== undefined) {
      await this.getUserPoolsActive(this.pools);
      console.log('get users', this.pools);

    } else {
      this.isWait = false;
      console.log('pools', this.pools);

    }
}

  /**
   * Get user pools staked to select one at create bambooField
   */
   async getUserPoolsActive(pools): Promise<any> {
      console.log('poollist', pools);
      this.pools = await this.contractService.getWeb3PoolList(pools);

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
    console.log('poolSelefcted', this.poolSelected);
    console.log('stakeNew', this.stakeNew);

    if (this.stakeNew <= 2000 || !this.poolSelected) {
      this.error = true;
    } else if (this.ownWallet.unstaked < this.stakeNew) {
      this.error = true;
    } else {
      this.error = false;
    }

  }

  /**
   * Selected Pool to set the field
   */
   selectPoolToField(row): void{
    this.displayedColumns = [
      'title',
    //  'back'
    ];
    this.poolSelected = row;
    console.log('displayed', this.displayedColumns);
    this.selected = true;
    this.pools = [this.poolSelected];

    this.dataSource = new MatTableDataSource<Pool>(this.pools);

    this.pool = this.poolSelected;

    console.log('displayed pool', this.displayedColumns);

    this.isError();

  }

  /**
   * Go back to all pools to select again
   */
  goBackToPools(): void {
    this.selected = false;
    this.poolSelected = null;
    this.getUserPools();
  }

  /**
   * Register the first Stake
   */
  registerBamboo(): void {
    if (this.stakeNew >= 2001 && this.poolSelected.address) {
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
        pool: this.poolSelected
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
   * Create the first Field
   */
  async setNewField(seed): Promise<void> {
    const amount = this.registerCost.plus(seed.seeds);
    this.pandaSpinnerService.open();
    // Approve
    try {
      await this.contractService.validateAllowance(this.bambooData, this.addresses.bambooField_address, amount);
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
      this.pandaSpinnerService.close();
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




