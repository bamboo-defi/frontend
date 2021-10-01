import { Injectable } from '@angular/core';
import {ConnectionService} from '../../contract-connection/connection.service';
import {UtilService} from '../utils/util.service';
import BigNumber from 'bignumber.js';
const ethBridgeAbi = require('../abi/BridgeEth.json');
import {NetworkService} from 'src/app/services/contract-connection/network.service';


@Injectable({
  providedIn: 'root'
})
export class BridgeService {

  addresses: any;

  constructor(
    private connService: ConnectionService,
    private utils: UtilService,
    private networkService: NetworkService
  ) {
    this.addresses = networkService.getAddressNetwork();
  }

  // Ticket purchase operation for BBYP
  public async sendToBsc(bscAddr: String, amount: BigNumber): Promise<any> {
    await this.connService.syncAccount();
    const ethBridge = new this.connService.web3js.eth.Contract(ethBridgeAbi, this.addresses.ethBridge_address);
    return await ethBridge.methods.burn(bscAddr, this.utils.fromBNtoWei(amount)).send({from: this.connService.accounts[0]});
  }

}
