import { Component, OnInit } from '@angular/core';
import { OwnWallet } from 'src/app/interfaces/own-wallet';
import { ContractService } from 'src/app/services/contracts/contract.service';
import {ConnectionService} from "../../services/contract-connection/connection.service";

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.scss']
})
export class BalanceComponent implements OnInit {

  ownWallet: OwnWallet;
  isWait = false;
  isConnected = false;

  constructor(
    private contractService: ContractService,
    private connService: ConnectionService
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
    if (this.connService.provider === undefined){
      this.isConnected = false;
    } else {
      this.ownWallet = await this.contractService.getOwnWallet();
      this.isConnected = true;
    }
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
