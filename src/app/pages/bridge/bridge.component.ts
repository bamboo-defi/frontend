import { Component, OnInit } from '@angular/core';
import { Bridge } from 'src/app/interfaces/bridge';
import { ContractService } from 'src/app/services/contracts/contract.service';
import BigNumber from 'bignumber.js';
import { NetworkService } from 'src/app/services/contract-connection/network.service';
import { TokenService } from 'src/app/services/contracts/token/token.service';
import { UtilService } from 'src/app/services/contracts/utils/util.service';
import { ConnectionService } from 'src/app/services/contract-connection/connection.service';
import { BridgeService } from 'src/app/services/contracts/bridge/bridge.service';
import { AlertService } from 'src/app/_alert';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-bridge',
  templateUrl: './bridge.component.html',
  styleUrls: ['./bridge.component.scss']
})
export class BridgeComponent implements OnInit {

  addresses: any;
  isApproved: boolean;
  net: string = environment.netName;
  netTo: string;
  bridge: Bridge = {
    wallet: '',
    amount: null
  };

  constructor(
    private contractService: ContractService,
    private networkService: NetworkService,
    private tokenService: TokenService,
    private utilsService: UtilService,
    private bridgeService: BridgeService,
    private connService: ConnectionService,
    private alertService: AlertService) { }

  async ngOnInit(): Promise<void> {
    if (this.net === 'Ethereum'){
      this.netTo = 'Binance Smart Chain';
    }
    if (this.net === 'Binance Smart Chain'){
      this.netTo = 'Velas';
    }
    if (this.net === 'Velas'){
      this.netTo = 'Binance Smart Chain';
    }
    this.addresses = this.networkService.getAddressNetwork();
    this.isApproved = await this.isBridgeApproved();
    console.log('approved on init', this.isApproved);
  }

  async toBridge(): Promise<void> {
    const amount = new BigNumber(this.bridge.amount);
    await this.bridgeService.sendToBsc(this.bridge.wallet, amount);
  }

  async isBridgeApproved(): Promise<boolean> {
    try {
      // Get Bamboo info
      let bambooData = await this.tokenService.getBAMBOOData();
      const allowance1 = this.utilsService.fromWeiToBN(
        await this.tokenService.getAllowance(bambooData.addr, this.addresses.ethBridge_address), bambooData.decimals);
      if (allowance1.isLessThanOrEqualTo(0)
        || this.connService.provider === undefined) {
        return false;
      }
      this.isApproved = true;
      console.log('is approved');
      return true;
    } catch (err) {
    }
  }

  async approveBridge(): Promise<void> {
    // Get Bamboo info
    let bambooData = await this.tokenService.getBAMBOOData();
    try {
      await this.contractService.validateAllowance(bambooData, this.addresses.ethBridge_address, new BigNumber(0));
      this.isApproved = true;
      console.log('is approved bridge');

    } catch (error) {
      this.alertService.error('Please connect your wallet!!');
    }
  }
}
