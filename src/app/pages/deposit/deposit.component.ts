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

const FLOOR_DECIMALS = 10000000000000000000;
const NUMBER_DECIMALS = 18;
const ZERO = '0';

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.scss']
})
export class DepositComponent implements OnInit {

  ok = true;
  noDeal = false;
  id: string;
  stakeAmount: string;
  available: string;
  maxSeeds: string;
  isValid: boolean;

  tokenData: TokenData;
  underlyingAmount: BigNumber;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    public dialogRef: MatDialogRef<DepositComponent>,
    private keeperService: KeeperService,
    private tokenService: TokenService,
    public dialogPandaSpinner: MatDialog,
    private alertService: AlertService,
    private pandaSpinnerService: PandaSpinnerService,
    private utilsService: UtilService
  ) {
  }

  ngOnInit(): void {
    this.getAvailable(this.data.row.address);
    this.isValid = false;
  }

  /**
   * Get available slp tokens to spend. Need Service
   */
  async getAvailable(address): Promise<void> {
    this.tokenData = await this.tokenService.getTokenData(address);
    this.available =  Number(this.tokenData.balance.toFixed(NUMBER_DECIMALS)) > 0 ? this.tokenData.balance.toFixed(NUMBER_DECIMALS) : ZERO;
  }

  /**
   * Set max amount of seeds. Need Service
   */
  setMaxSeeds(): string {
    this.stakeAmount = Number(this.tokenData.balance.toFixed(NUMBER_DECIMALS)) > 0 ? this.tokenData.balance.toFixed(NUMBER_DECIMALS) : ZERO;
    return this.stakeAmount;
  }

  /**
   * Need service. Genera depósito de slp en la pool
   */
  async depositSlp(): Promise<void> {
    const amount = new BigNumber(this.stakeAmount);
    this.dialogRef.close({amount, tokenData: this.tokenData});
  }

}
