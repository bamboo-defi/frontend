import { Component, OnInit } from '@angular/core';
import { OwnWallet } from 'src/app/interfaces/own-wallet';
import { ContractService } from 'src/app/services/contracts/contract.service';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.scss']
})
export class BalanceComponent implements OnInit {

  ownWallet: OwnWallet;
  isWait = false;

  constructor(
    private contractService: ContractService
  ) { }

  ngOnInit(): void {

    this.isWait = true;

    this.ownWallet = {
      unstaked: 0,
      staked: 0,
      toHarvest: 0,
      bambooField: 0,
      totalBamboo: 0
    };

    this.getOwnWallet();
  }

  /**
   * Gets connected wallet data
   */
  async getOwnWallet(): Promise<any> {
    this.ownWallet = await this.contractService.getOwnWallet();
    this.isWait = false;
  }

  /**
   * Refreshes connected wallet data
   */
  refreshWallet(): void {
    this.isWait = true;
    this.getOwnWallet();
  }
}
