import {Component, Inject, OnInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-harvest',
  templateUrl: './harvest.component.html',
  styleUrls: ['./harvest.component.scss']
})
export class HarvestComponent implements OnInit {

  setSeedsToHarvest: number;
  seedsToHarvest: number;
  bambooReceived: number;

  constructor(
    public dialogRef: MatDialogRef<HarvestComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
  }

  ngOnInit(): void {
  }

  /**
   * Calculate Bamboo per Seeds
   */
  setSeedToBamboo(): void {
    this.bambooReceived = this.setSeedsToHarvest / this.data.seedValue;
  }

  /**
   * Add new seeds to the total on close
   */
  harvestSeeds(): void {
    const newSeeds = {
      totalSeedsToHarvest: this.seedsToHarvest,
      toHarvest: this.setSeedsToHarvest
    };
    this.dialogRef.close(newSeeds);
  }

  /**
   * Close the dialog
   */
  onNoClick(): void {
    this.dialogRef.close();
  }

  /**
   * Set max Seeds
   */
  setMaxSeeds(): number {
    this.setSeedsToHarvest = this.data.seedsToHarvest;
    this.setSeedToBamboo();
    return this.setSeedsToHarvest;
  }
}
