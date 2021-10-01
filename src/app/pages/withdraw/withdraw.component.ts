import {Component, Inject, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {KeeperService} from 'src/app/services/contracts/keeper/keeper.service';
import {TokenService} from 'src/app/services/contracts/token/token.service';
import {TokenData} from 'src/app/interfaces/contracts';
import BigNumber from 'bignumber.js';
import {PandaspinnerComponent} from '../pandaspinner/pandaspinner.component';
import {AlertService} from '../../_alert';
import { PandaSpinnerService } from '../pandaspinner/pandaspinner.service';
import { UtilService } from 'src/app/services/contracts/utils/util.service';

const FLOOR_DECIMALS = 1000000000000000000;
const NUMBER_DECIMALS = 18;

@Component({
  selector: 'app-withdraw',
  templateUrl: './withdraw.component.html',
  styleUrls: ['./withdraw.component.scss']
})
export class WithdrawComponent implements OnInit {

  ok = true;
  noDeal = false;
  id: string;
  unstakeAmmount: string;
  available: string;
  maxSeeds: number;
  reward: number;

  tokenData: TokenData;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private keeperService: KeeperService,
    private tokenService: TokenService,
    public dialogRef: MatDialogRef<WithdrawComponent>,
    public dialogPandaSpinner: MatDialog,
    private alertService: AlertService,
    private pandaSpinnerService: PandaSpinnerService,
    private utilsService: UtilService
  ) {
  }

  ngOnInit(): void {
    this.getAvailable(this.data.row.id, this.data.row.address);
  }

  // Get available SLP tokens to withdraw
  async getAvailable(id, address): Promise<void> {
    this.tokenData = await this.tokenService.getTokenData(address);
    const data = await this.keeperService.getStakedLP(id, this.tokenData);
    this.available = Number(data.toFixed(NUMBER_DECIMALS)) > 0 ? data.toFixed(NUMBER_DECIMALS) : '0';
    this.reward = this.data.row.reward;
  }

  // Set max ammount of seeds. Need Service
  setMaxSeeds(): void {
    this.unstakeAmmount = this.available;
  }

  // Generates SLP deposit in the pool
  async withdrawSlp(): Promise<void> {
    const amount = new BigNumber(this.unstakeAmmount);
    this.dialogRef.close({amount, tokenData: this.tokenData});
  }

}
