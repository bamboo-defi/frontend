import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Ammount } from 'src/app/interfaces/ammount';
import { OwnWallet } from 'src/app/interfaces/own-wallet';
import { Staking } from 'src/app/interfaces/staking';
import { TimeValue } from 'src/app/interfaces/time-value';
import { ToStake } from 'src/app/interfaces/to-stake';
import { ConfirmComponent } from '../confirm/confirm.component';
import { TokenService } from 'src/app/services/contracts/token/token.service';
import { BambooStakeBonus, DepositInfo, TokenData } from 'src/app/interfaces/contracts';
import BigNumber from 'bignumber.js';
import { KeeperService } from 'src/app/services/contracts/keeper/keeper.service';
import { ContractService } from 'src/app/services/contracts/contract.service';
import { NetworkService } from 'src/app/services/contract-connection/network.service';
import { PandaspinnerComponent } from '../pandaspinner/pandaspinner.component';
import { AlertService } from '../../_alert';
import { PandaSpinnerService } from '../pandaspinner/pandaspinner.service';
import { UtilService } from 'src/app/services/contracts/utils/util.service';
import { environment } from 'src/environments/environment';

const SHOW_DECIMALS = 3;

@Component({
  selector: 'app-staking',
  templateUrl: './staking.component.html',
  styleUrls: ['./staking.component.scss']
})
export class StakingComponent implements OnInit {

  network = environment.net;
  addresses;
  allow = false;
  ownWallet: OwnWallet = {
    unstaked: 0,
    staked: 0,
    toHarvest: 0,
    bambooField: 0,
    totalBamboo: 0,
  };

  toStake: ToStake = {
    total: null,
    toStakeAmmount: null,
    maxToStake: null,
    timeToStake: null,
    multiplyStake: null,
    totalBambooToStake: null
  };

  amounts =  [500, 5000, 10000, 50000, 100000, 500000, 5000000, 25000000, 50000000, 100000000];
  minimumBamboo = 500;
  // Set bamboo ammount

  bambooAmmount: Ammount[] = [
    {bamboo: 500, ind: 0, bambooSelect: '500'},
    {bamboo: 5000, ind: 1, bambooSelect: '5.000'},
    {bamboo: 10000, ind: 2, bambooSelect: '10.000'},
    {bamboo: 50000, ind: 3, bambooSelect: '50.000'},
    {bamboo: 100000, ind: 4, bambooSelect: '100.000'},
    {bamboo: 500000, ind: 5, bambooSelect: '500.000'},
    {bamboo: 5000000, ind: 6, bambooSelect: '5.000.000'},
    {bamboo: 25000000, ind: 7, bambooSelect: '25.000.000'},
    {bamboo: 50000000, ind: 8, bambooSelect: '50.000.000'},
    {bamboo: 100000000, ind: 9, bambooSelect: '100.000.000'}
  ];


  bambooToStake: Ammount;

  timeValue: TimeValue[] = [
    {text: '1 day', value: 1, ind: 0},
    {text: '7 days', value: 7, ind: 1},
    {text: '15 days', value: 15, ind: 2},
    {text: '30 days', value: 30, ind: 3},
    {text: '60 days', value: 60, ind: 4},
    {text: '90 days', value: 90, ind: 5},
    {text: '180 days', value: 180, ind: 6},
    {text: '1 year', value: 365, ind: 7},
    {text: '2 year', value: 730, ind: 8},
    {text: '3 years', value: 1095, ind: 9},
    {text: '4 years', value: 1460, ind: 10},
    {text: '5 years', value: 1825, ind: 11},
  ];

  // lockedCapital = [
  //   { bamboo: 500, range: 0 }
  // ];

  temporalityStake: number[][] = [
    [1.0001, 1.0008, 1.0016, 1.005, 1.03, 1.05, 1.1, 1.5, 2, 2.3, 4.6, 5],
    [1.0004, 1.003, 1.008, 1.03, 1.05, 1.06, 1.15, 1.7, 2.5, 3.1, 6.2, 7],
    [1.0006, 1.0045, 1.01, 1.06, 1.08, 1.09, 1.2, 1.9, 2.9, 3.9, 7.8, 8],
    [1.0008, 1.006, 1.013, 1.09, 1.12, 1.13, 1.25, 2.1, 3.3, 4.7, 9.4, 10],
    [1.001, 1.008, 1.017, 1.12, 1.16, 1.17, 1.3, 2.3, 3.7, 5, 10, 11],
    [1.0011, 1.0081, 1.018, 1.15, 1.2, 1.25, 1.4, 2.5, 4.1, 5.5, 11, 12],
    [1.0012, 1.0082, 1.0185, 1.18, 1.24, 1.3, 1.5, 2.6, 4.7, 6, 12, 13],
    [1.0013, 1.0095, 1.02, 1.21, 1.3, 1.4, 1.6, 2.7, 6, 10, 20, 30],
    [1.0014, 1.01, 1.03, 1.25, 1.33, 1.5, 1.7, 2.8, 7, 15, 30, 35],
    [1.0015, 1.011, 1.05, 1.3, 1.5, 1.55, 1.95, 3, 8, 20, 35, 40]
  ];

  stakings: Staking[] = [{
    ammount: null,
    time: null,
    daysTo: null,
    roi: '5',
    acumulated: 5852,
    id: 0,
    timeLeft: null
  }];

  multiplier: number;
  dataSource;

  displayedColumns: string[] = [
    'ammount',
    'time',
    'daysTo',
    'roi',
    'acumulated',
    'withdraw'
  ];

  bambooData: TokenData;
  roiReturned: number;
  error: string;

  @ViewChild(MatSort, { static: true })
  sort: MatSort;
  @ViewChild(MatAccordion) accordion: MatAccordion;

  constructor(
    public dialog: MatDialog,
    private keeperService: KeeperService,
    private tokenService: TokenService,
    private contractService: ContractService,
    private alertService: AlertService,
    private pandaSpinnerService: PandaSpinnerService,
    private networkService: NetworkService,
    private utilService: UtilService
  ) {
    this.addresses = networkService.getAddressNetwork();
  }

  ngOnInit(): void {
    this.allow = false;
    // Start timeToStake
    this.toStake.timeToStake = this.timeValue[0];
    this.allowance();
    this.getData();
  }

  async allowance(): Promise<void>{
    const allowance1 = this.utilService.fromWeiToBN(
      await this.tokenService.getAllowance(this.addresses.bambooToken_address, this.addresses.router_address), 18);
    if (allowance1.isLessThanOrEqualTo(0)) {
      // Exact amout or a bignumber to save gas
      this.allow = false;
    } else {
      this.allow = true;
    }
  }

  async getData(): Promise<void> {
    this.stakings = [];
    this.allowance();
    await this.getOwnWallet();
  }

  // Need service
  async getOwnWallet(): Promise<void> {
    if (!this.contractService.isConnection()) {
      return;
    }
    // Get Bamboo info
    this.bambooData = await this.tokenService.getBAMBOOData();
    // No need to complete the OwnWallet, since only unstaked is used
    this.ownWallet.unstaked = Number(this.bambooData.balance.toFixed(SHOW_DECIMALS));
    // Get staking data from user
    const deposits = await this.keeperService.getDeposits();
    const closestAmountInd = this.getClosest(this.ownWallet.unstaked);
    // Find closest amount to stake
    // if (closestAmountInd >= 0) {
    this.bambooToStake = null;
    //   this.setMultiplier();
    // }
    for (const depositId of deposits) {
      const depositInfo: DepositInfo = await this.keeperService.getDepositInfo(depositId);
      const timestamp = Math.floor(Date.now() / 1000);
      let daysLeft = depositInfo.withdrawTime;
      const ammountToMultiply = Number(depositInfo.amount);
      const tempToMultiply = Math.floor((depositInfo.withdrawTime - Number(depositId)) / 86400);
      this.roiReturned = this.setRoiMultiplier(ammountToMultiply, tempToMultiply);
      const claimable: BambooStakeBonus = await this.keeperService.getPendingStakeBAMBOO(depositId);
      const dateLeft = ((depositInfo.withdrawTime * 1000) - new Date().getTime()) / 1000;

      // Amount should match table
      const lockTime = depositInfo.withdrawTime - Number(depositId);
      const roiS = await this.keeperService.getStakeMultiplier(depositInfo.amount, lockTime);
      this.stakings.push({
        ammount: depositInfo.amount.toFixed(0),
        time: Math.floor((depositInfo.withdrawTime - Number(depositId)) / 86400), // Full locktime in days
        daysTo: daysLeft, // How ,any days until withdraw

        //Multiplicador
        roi: 'x' + roiS,
        acumulated: Number(claimable.claimableNow.toFixed(SHOW_DECIMALS)),
        id: depositId,
        timeLeft: dateLeft
      });
      this.utilService.sortByTime(this.stakings);
    }
  }

  // Set multiplier like Temporality Stake Bamboo System table
  setMultiplier(): any {
    this.error = this.bambooData && this.bambooData.balance.isLessThan(this.bambooToStake.bamboo) ? 'error' : null;
    if (this.bambooToStake && this.toStake.timeToStake) {
      this.toStake.toStakeAmmount = this.bambooToStake.bamboo;
      const time = this.toStake.timeToStake.ind;
      const ammount = this.bambooToStake.ind;
      this.multiplier = this.temporalityStake[ammount][time];
      return this.multiplier;
    }
    return 0;
  }

  setRoiMultiplier(ammount, time): number {
    const foundTime = this.timeValue.find(value => value.value === time);
    const foundAmmount = this.bambooAmmount.find(value => value.bamboo === ammount);
    return this.temporalityStake[foundAmmount.ind][foundTime.ind];
  }

  // Set new stake
  onSubmit(): string {
    if (this.toStake.toStakeAmmount <= 49) {
      return this.error = 'error';
    }
    if (this.toStake.toStakeAmmount >= 49 && this.toStake.timeToStake) {
      const operationData = {
        name: 'toStake',
        ammount: this.bambooToStake.bambooSelect,
        time: this.toStake.timeToStake.value,
        multiplier: this.multiplier
      };
      // Confirm Dialog
      const dialogRef = this.dialog.open(ConfirmComponent, {
        width: '450px',
        data: operationData
      });
      dialogRef.afterClosed().subscribe(async (result) => {
        if (result) {
          await this.assignStakeToUser();
        } else {
          return;
        }
      });
    }
  }

  // Create Stake to user, need apropiate Service
  async assignStakeToUser(): Promise<void> {
    this.pandaSpinnerService.open();
    try {
      const amount = this.toStake.toStakeAmmount.toString();
      // Approve
      await this.contractService.validateAllowance(this.bambooData, this.addresses.zooKeeper_address, new BigNumber(amount));
      // Get stake time in days
      const time = Number(this.toStake.timeToStake.value) * 86400;
      const receipt = await this.keeperService.depositBamboo(new BigNumber(amount), time);


      this.toStake.toStakeAmmount = null;
      this.toStake.timeToStake = this.timeValue[0];
      this.multiplier = null;
      this.toStake.timeToStake = null;
      this.stakings = null;
      await this.getData();
      this.alertService.success('Success');
    } catch (error) {
      this.alertService.error('Error: ' + error.message);
    } finally {
      this.pandaSpinnerService.close();
    }
  }

  getClosest(balance): number {
    const found = this.amounts.findIndex(element => element > balance);
    if (found === 0) {
      return -1;
    }
    return (found - 1);
  }

  async refreshData(withdraw): Promise<void> {
    if(withdraw){
      this.stakings = [];
      await this.getOwnWallet();
    }
  }
}
