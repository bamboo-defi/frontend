import {Component, Inject, OnInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {OwnWallet} from 'src/app/interfaces/own-wallet';
import {Pool} from 'src/app/interfaces/pool';
import {Seed} from 'src/app/interfaces/seed';
import BigNumber from 'bignumber.js';
import {ContractService} from 'src/app/services/contracts/contract.service';

@Component({
  selector: 'app-add-seeds',
  templateUrl: './add-seeds.component.html',
  styleUrls: ['../bamboofield/bamboofield.component.scss']
})
export class AddSeedsComponent implements OnInit {

  newSeedsAmmount: number;
  seedsNew: number;
  underlyingAmount: BigNumber;
  totalSeeds: number = null;
  pools: Pool[];
  pool: Pool;

  ownWallet: OwnWallet = {
    unstaked: 100000000,
    staked: 0,
    toHarvest: 0,
    bambooField: 0,
    totalBamboo: 0,
  };

  constructor(
    public dialogRef: MatDialogRef<Seed>,
    @Inject(MAT_DIALOG_DATA) public data,
    public contractService: ContractService
  ) {
  }

  ngOnInit(): void {
    this.getOwnWallet();
  }

  /**
   * Gets connected wallet data
   */
  async getOwnWallet(): Promise<void> {
    this.ownWallet = await this.contractService.getOwnWallet();
  }

  /**
   * Event that show the seed/bamboo value to add seeds to total
   */
  setSeedChange(): void {
    this.underlyingAmount = new BigNumber(this.seedsNew).times(this.data.seedsValue);
    this.newSeedsAmmount = Number(this.underlyingAmount.toFixed(5));
    this.totalSeeds = this.newSeedsAmmount + this.data.seedsInitial;
  }

  /**
   * Add new seeds to the total on close
   */
  setNewSeedsAmount(): void {
    const newSeeds = {
      totalSeeds: this.totalSeeds,
      pool: this.pool,
      amount: new BigNumber(this.seedsNew)
    };
    this.dialogRef.close(newSeeds);
  }

  /**
   * Close the dialog
   */
  onNoClick(): void {
    this.dialogRef.close();
  }

}
