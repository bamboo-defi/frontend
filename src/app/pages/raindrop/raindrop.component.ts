import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Bbyp } from 'src/app/interfaces/bbyp';
import { OwnWallet } from 'src/app/interfaces/own-wallet';
import { Raindrop } from 'src/app/interfaces/raindrop';
import { ConfirmComponent } from '../confirm/confirm.component';
import { TokenService } from 'src/app/services/contracts/token/token.service';
import { TokenData } from 'src/app/interfaces/contracts';
import BigNumber from 'bignumber.js';
import { ContractService } from 'src/app/services/contracts/contract.service';
import { NetworkService } from 'src/app/services/contract-connection/network.service';
import { RaindropService } from 'src/app/services/contracts/raindrop/raindrop.service';
import { BbypService } from 'src/app/services/contracts/bbyp/bbyp.service';
import { PandaspinnerComponent } from '../pandaspinner/pandaspinner.component';
import { AlertService } from '../../_alert';
import { PandaSpinnerService } from '../pandaspinner/pandaspinner.service';
import { environment } from 'src/environments/environment';

const SHOW_DECIMALS = 5;

@Component({
  selector: 'app-raindrop',
  templateUrl: './raindrop.component.html',
  styleUrls: ['./raindrop.component.scss']
})
export class RaindropComponent implements OnInit {

  addresses;

  isWait = false;

  raindrop: Raindrop = {
    reward: 0,
    totalUserTikets: 0,
    tiketsToBuy: null,
    userTiketsNumber: null,
    timeToNextLottery: '2021-00-00T00:00:00Z',
    lastNumber: [],
  };

  bbyp: Bbyp = {
    reward: 0,
    totalUserTikets: 0,
    tiketsToBurn: null,
    userTiketsNumber: [],
    timeToNextLottery: '2021-00-00T00:00:00Z',
    lastNumber: 0,
  };

  ownWallet: OwnWallet;
  walletData: TokenData;

  ticketPrice: BigNumber;
  bbypTicketPrice: BigNumber;

  error: string;
  errorBbyp: string;
  isConnect: string;

  constructor(
    public dialog: MatDialog,
    private tokenService: TokenService,
    private rainService: RaindropService,
    private contractService: ContractService,
    private bbypService: BbypService,
    private alertService: AlertService,
    private pandaSpinnerService: PandaSpinnerService,
    private networkService: NetworkService
  ) {
    this.addresses = networkService.getAddressNetwork();
  }

  ngOnInit(): void {
    this.isConnect = localStorage.getItem('connected');
    this.isWait = true;
    this.initWallet();
    this.getChainData();
  }

  // User's wallet connection and get data
  async initWallet(): Promise<void> {
    if (!this.contractService.isConnection()) {
      return;
    }
    this.walletData = await this.tokenService.getBAMBOOData();
    this.ownWallet = {
      unstaked: Number(this.walletData.balance.toFixed(SHOW_DECIMALS)),
      staked: null,
      toHarvest: null,
      bambooField: null,
      totalBamboo: 0
    };
  }

  // Get the info on-chain for Raindrop and BBYP
  async getChainData(): Promise<void> {
    if (!this.contractService.isConnection()) {
      // Get prices if wallet not connected
      this.ticketPrice = environment.net === 'ETH' ? new BigNumber(100) : new BigNumber(30);
      this.bbypTicketPrice = environment.net === 'ETH' ? new BigNumber(10) : new BigNumber(50);
      return;
    }
    // Get prices
    this.ticketPrice = await this.rainService.getTicketPrice();
    this.bbypTicketPrice = await this.bbypService.getTicketPrice();
    // Get Rain User data
    this.raindrop.totalUserTikets = Number(await this.rainService.getNTickets());
    this.raindrop.reward = Number((await this.rainService.getPrizePool()).toFixed(SHOW_DECIMALS));
    this.raindrop.timeToNextLottery = new Date(Number(await this.rainService.getNextLottery()) * 1000).toISOString();
    // Get BBYP User Data
    this.bbyp.totalUserTikets = Number(await this.bbypService.getNTickets());
    this.bbyp.reward = Number((await this.bbypService.getPrizePool()).toFixed(SHOW_DECIMALS));
    this.bbyp.timeToNextLottery = new Date(Number(await this.bbypService.getNextLottery()) * 1000).toISOString();
    this.isWait = false;
  }

  // Set number of Raindrop tickets to purchase
  setValidValue(): string {
    if (this.ticketPrice.times(this.raindrop.tiketsToBuy).isGreaterThan(this.ownWallet.unstaked)) {
      return this.error = 'raindrop.errorCoin';
    } else {
      return this.error = null;
    }
  }

  // Set number of BBYP tickets to purchase
  setValidBbypValue(): string {
    if (this.bbypTicketPrice.times(this.bbyp.tiketsToBurn).isGreaterThan(this.ownWallet.unstaked)) {
      return this.errorBbyp = 'raindrop.errorCoin';
    } else {
      return this.errorBbyp = null;
    }
  }

  // Raindrop ticket purchase transaction
  onSubmit(): string {
    if (this.raindrop.tiketsToBuy >= this.ownWallet.unstaked) {
      return this.error = 'raindrop.errorCoin';
    } else {

      // Data to confirm
      const operationData = {
        name: 'raindrop',
        tikets: this.raindrop.tiketsToBuy,
        bambooAmount: this.ticketPrice.times(this.raindrop.tiketsToBuy).toFixed(SHOW_DECIMALS)
      };

      // Confirm Dialog
      const dialogRef = this.dialog.open(ConfirmComponent, {
        width: '450px',
        data: operationData
      });
      dialogRef.afterClosed().subscribe(async (result) => {
        if (result) {
          await this.assignTiketsRaindropToUser();
        } else {
          return;
        }
      });
    }
  }

  // BBYP ticket purchase transaction
  onSubmitBbyp(): string {
    if (this.bbyp.tiketsToBurn >= this.ownWallet.unstaked) {
      return this.errorBbyp = 'raindrop.errorCoin';
    } else {

      // Data to confirm
      const operationData = {
        name: 'bbyp',
        tikets: this.bbyp.tiketsToBurn,
        bambooAmount: this.bbypTicketPrice.times(this.bbyp.tiketsToBurn).toFixed(SHOW_DECIMALS)
      };

      // Confirm Dialog
      const dialogRef = this.dialog.open(ConfirmComponent, {
        width: '450px',
        data: operationData
      });
      dialogRef.afterClosed().subscribe(async (result) => {
        if (result) {
          await this.assignTiketsBBYPToUser();
        } else {
          return;
        }
      });
    }
  }

  // User raindrop ticket purchasing function
  async assignTiketsRaindropToUser(): Promise<void> {
    this.pandaSpinnerService.open();
    try {
      await this.contractService.validateAllowance(this.walletData, this.addresses.raindrop_address, this.ticketPrice.times(this.raindrop.tiketsToBuy));
      const receipt = await this.rainService.buyTickets(this.raindrop.tiketsToBuy);
      this.raindrop.tiketsToBuy = null;
      await this.getChainData();
      this.alertService.success('Success');
    } catch (error) {
      this.alertService.error('Error: ' + error.message);
    } finally {
      this.pandaSpinnerService.close();
    }
  }

  // User BBYP ticket purchasing function
  async assignTiketsBBYPToUser(): Promise<void> {
    this.pandaSpinnerService.open();
    try {
      await this.contractService.validateAllowance(this.walletData, this.addresses.bbyp_address, this.bbypTicketPrice.times(this.bbyp.tiketsToBurn));
      const receipt = await this.bbypService.buyTickets(this.bbyp.tiketsToBurn);
      this.bbyp.tiketsToBurn = null;
      await this.getChainData();
      this.alertService.success('Success');
    } catch (error) {
      this.alertService.error('Error: ' + error.message);
    } finally {
      this.pandaSpinnerService.close();
    }
  }

}
