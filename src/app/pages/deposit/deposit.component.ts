import {Component, Inject, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {KeeperService} from 'src/app/services/contracts/keeper/keeper.service';
import {TokenService} from 'src/app/services/contracts/token/token.service';
import {TokenData} from 'src/app/interfaces/contracts';
import BigNumber from 'bignumber.js';
import {PandaspinnerComponent} from '../pandaspinner/pandaspinner.component';
import {AlertService} from '../../_alert';

const FLOOR_DECIMALS = 1000000;


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

  tokenData: TokenData;
  underlyingAmount: BigNumber;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    public dialogRef: MatDialogRef<DepositComponent>,
    private keeperService: KeeperService,
    private tokenService: TokenService,
    public dialogPandaSpinner: MatDialog,
    private alertService: AlertService
  ) {
  }

  ngOnInit(): void {
    this.getAvailable(this.data.row.address);
  }

  /**
   * Get available slp tokens to spend. Need Service
   */
  async getAvailable(address): Promise<void> {
    this.tokenData = await this.tokenService.getTokenData(address);
    this.available = this.tokenData.balance.toFixed(5);
  }

  /**
   * Set max amount of seeds. Need Service
   */
  setMaxSeeds(): string {
    this.stakeAmount = (Math.floor(Number(this.tokenData.balance) * FLOOR_DECIMALS) / FLOOR_DECIMALS).toString();
    return this.stakeAmount;
  }

  /**
   * Need service. Genera depósito de slp en la pool
   */
  async depositSlp(): Promise<void> {
    const dialogPandaSpinner = this.getDialogPandaSpinner();
    try {
      const amount = new BigNumber(this.stakeAmount);
      const receipt = await this.keeperService.depositLP(this.data.row.id, amount, this.tokenData);
      this.ok = true;
      this.dialogRef.close(this.ok);
      this.alertService.success('Success');
    } catch (error) {
      this.alertService.error('Error: ' + error.message);
    } finally {
      this.dialogRef.close();
      dialogPandaSpinner.close();
    }
  }

  /**
   * PandaSpinner Dialog
   */
  private getDialogPandaSpinner(): any {
    return this.dialogPandaSpinner.open(PandaspinnerComponent, {
      closeOnNavigation: false,
      disableClose: true,
      panelClass: 'panda-spinner'
    });
  }
}
