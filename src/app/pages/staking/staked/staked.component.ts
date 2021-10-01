import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TokenData } from 'src/app/interfaces/contracts';
import { OwnWallet } from 'src/app/interfaces/own-wallet';
import { Staking } from 'src/app/interfaces/staking';
import { KeeperService } from 'src/app/services/contracts/keeper/keeper.service';
import { AlertService } from 'src/app/_alert';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { PandaSpinnerService } from '../../pandaspinner/pandaspinner.service';

const SHOW_DECIMALS = 3;

@Component({
  selector: 'app-staked',
  templateUrl: './staked.component.html',
  styleUrls: ['./staked.component.scss']
})
export class StakedComponent implements OnInit {


  @Input('staking') staking: Staking;
  @Output('withdraw') withdraw: EventEmitter<boolean> = new EventEmitter<boolean>();

  bambooData: TokenData;
  roiReturned: number;
  error: string;
  dataSource: MatTableDataSource<Staking>;
  sort: MatSort;

  constructor(
    public dialog: MatDialog,
    private keeperService: KeeperService,
    private alertService: AlertService,
    private pandaSpinnerService: PandaSpinnerService,
  ) {

  }

  ngOnInit(): void {
  }

  // Withdraw Stake
  withdrawStake(row: Staking): void {
    const operationData = {
      stake: row,
      name: 'withdrawStaking'
    };

    // Confirm Dialog
    const dialogRef = this.dialog.open(ConfirmComponent, {
      width: '450px',
      data: operationData
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.withdrawStakeTotal(row);
      } else {
        return;
      }
    });
  }

  // Withdraw confirmed
  async withdrawStakeTotal(data): Promise<void> {
    this.pandaSpinnerService.open();
    try {
      const receipt = await this.keeperService.withdrawBamboo(data.id.toString());
      this.alertService.success('Success');
      this.withdraw.emit(true);
    } catch (error) {
      this.alertService.error('Error: ' + error.message);
      this.withdraw.emit(false);
    } finally {
      this.pandaSpinnerService.close();
    }
  }

  // Get acumulated ammount
  withdrawAcumulatedRoi(row: Staking): void {
    const operationData = {
      stake: row,
      name: 'withdrawAcumulated'
    };
    // Confirm Dialog
    const dialogRef = this.dialog.open(ConfirmComponent, {
      width: '450px',
      data: operationData
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.withdrawAcumulatedAmmount(row);
      } else {
        return;
      }
    });

  }

  // Withdraw acumulated Ammount confirmed
  async withdrawAcumulatedAmmount(data: Staking): Promise<void> {
    this.pandaSpinnerService.open();
    try {
      await this.keeperService.withdrawDailyBamboo(data.id.toString());
      const claimable = await this.keeperService.getPendingStakeBAMBOO(data.id.toString());
      data.acumulated = Number(claimable.claimableNow.toFixed(SHOW_DECIMALS));
      this.alertService.success('Success');
    } catch (error) {
      this.alertService.error('Error: ' + error.message);
    } finally {
      this.pandaSpinnerService.close();
    }
  }
}
