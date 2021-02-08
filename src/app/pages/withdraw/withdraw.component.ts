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
  selector: 'app-withdraw',
  templateUrl: './withdraw.component.html',
  styleUrls: ['./withdraw.component.scss']
})
export class WithdrawComponent implements OnInit {

  ok = true;
  noDeal = false;
  id: string;
  unstakeAmmount: string;
  available: number;
  maxSeeds: number;

  tokenData: TokenData;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private keeperService: KeeperService,
    private tokenService: TokenService,
    public dialogRef: MatDialogRef<WithdrawComponent>,
    public dialogPandaSpinner: MatDialog,
    private alertService: AlertService
  ) {
  }

  ngOnInit(): void {
    this.getAvailable(this.data.row.id, this.data.row.address);
  }

  // Get available SLP tokens to withdraw
  async getAvailable(id, address): Promise<void> {
    this.tokenData = await this.tokenService.getTokenData(address);
    this.available = Number(Math.floor(Number(await this.keeperService.getStakedLP(id, this.tokenData)) * FLOOR_DECIMALS) / FLOOR_DECIMALS);
  }

  // Set max ammount of seeds. Need Service
  setMaxSeeds() {
    this.unstakeAmmount = this.available.toString();
  }

  // Generates SLP deposit in the pool
  async withdrawSlp(): Promise<void> {
    const dialogPandaSpinner = this.getDialogPandaSpinner();
    try {
      const receipt = await this.keeperService.withdrawLP(this.data.row.id, new BigNumber(this.unstakeAmmount), this.tokenData);
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
