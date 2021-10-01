import { Injectable } from '@angular/core';
import {ConnectionService} from '../../contract-connection/connection.service';
import {UtilService} from '../utils/util.service';
import BigNumber from 'bignumber.js';
const bbypAbi = require('../abi/BBYP.json');
import {NetworkService} from 'src/app/services/contract-connection/network.service';


@Injectable({
  providedIn: 'root'
})
export class BbypService {

  addresses;

  constructor(
    private connService: ConnectionService,
    private utils: UtilService,
    private networkService: NetworkService
  ) {
    this.addresses = networkService.getAddressNetwork();
  }

  // Ticket purchase operation for BBYP
  public async buyTickets(nTickets: number): Promise<any> {
    await this.connService.syncAccount();
    const bbyp = new this.connService.web3js.eth.Contract(bbypAbi, this.addresses.bbyp_address);
    return await bbyp.methods.buyTickets(nTickets, 1).send({from: this.connService.accounts[0]});
  }

  // Returns the tickets in possession of the user for BBYP
  public async getNTickets(userAddr: string = '0x'): Promise<string> {
    await this.connService.syncAccount();
    if (userAddr === '0x'){
      userAddr = this.connService.accounts[0];
    }
    const bbyp = new this.connService.web3js.eth.Contract(bbypAbi, this.addresses.bbyp_address);
    return await bbyp.methods.getTickets(userAddr).call({from: this.connService.accounts[0]});
  }

  // Returns the ticket price for BBYP
  public async getTicketPrice(): Promise<BigNumber> {
    await this.connService.syncAccount();
    const bbyp = new this.connService.web3js.eth.Contract(bbypAbi, this.addresses.bbyp_address);
    const price =  await bbyp.methods.price().call({from: this.connService.accounts[0]});
    return this.utils.fromWeiToBN(price);
  }

  // Returns a UNIX timestamp
  public async getNextLottery(): Promise<string> {
    await this.connService.syncAccount();
    const bbyp = new this.connService.web3js.eth.Contract(bbypAbi, this.addresses.bbyp_address);
    return await bbyp.methods.purchaseLimit().call({from: this.connService.accounts[0]});
  }

  // Returns de prize of BBYP
  public async getPrizePool(): Promise<BigNumber> {
    await this.connService.syncAccount();
    const bbyp  = new this.connService.web3js.eth.Contract(bbypAbi, this.addresses.bbyp_address);
    const pool =  await bbyp.methods.prizePool().call({from: this.connService.accounts[0]});
    return this.utils.fromWeiToBN(pool);
  }
}
