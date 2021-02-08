import { Injectable } from '@angular/core';
import {ConnectionService} from '../../contract-connection/connection.service';
import BigNumber from 'bignumber.js';
const RaindropAbi = require('../abi/Raindrop.json');
import {raindrop_address} from '../../contract-connection/tools/addresses';
import {UtilService} from '../utils/util.service';



@Injectable({
  providedIn: 'root'
})
export class RaindropService {

  constructor(private connService: ConnectionService,
              private utils: UtilService) { }

  // Ticket purchase operation for Raindrop
  public async buyTickets(nTickets: number): Promise<any> {
    await this.connService.syncAccount();
    const raindrop = new this.connService.web3js.eth.Contract(RaindropAbi, raindrop_address);
    return await raindrop.methods.buyTickets(nTickets).send({from: this.connService.accounts[0]});
  }

  // Returns the tickets in possession of the user for Raindrop
  public async getNTickets(userAddr: string = '0x'): Promise<string> {
    await this.connService.syncAccount();
    if (userAddr === '0x'){
      userAddr = this.connService.accounts[0];
    }
    const raindrop = new this.connService.web3js.eth.Contract(RaindropAbi, raindrop_address);
    return await raindrop.methods.getTickets(userAddr).call({from: this.connService.accounts[0]});
  }

  // Returns the ticket price for Raindrop
  public async getTicketPrice(): Promise<BigNumber> {
    await this.connService.syncAccount();
    const raindrop = new this.connService.web3js.eth.Contract(RaindropAbi, raindrop_address);
    const price =  await raindrop.methods.price().call({from: this.connService.accounts[0]});
    return this.utils.fromWeiToBN(price);
  }

  // Returns the last winners of the Raindrop
  public async getLastWinners(): Promise<string[]> {
    await this.connService.syncAccount();
    const raindrop = new this.connService.web3js.eth.Contract(RaindropAbi, raindrop_address);
    return await raindrop.methods.getLastWinners().call({from: this.connService.accounts[0]});
  }

  // Returns a UNIX timestamp
  public async getNextLottery(): Promise<string> {
    await this.connService.syncAccount();
    const raindrop = new this.connService.web3js.eth.Contract(RaindropAbi, raindrop_address);
    return await raindrop.methods.nextRain().call({from: this.connService.accounts[0]});
  }

  // Returns de prize of BBYP
  public async getPrizePool(): Promise<BigNumber> {
    await this.connService.syncAccount();
    const raindrop  = new this.connService.web3js.eth.Contract(RaindropAbi, raindrop_address);
    const pool =  await raindrop.methods.prizePool().call({from: this.connService.accounts[0]});
    return this.utils.fromWeiToBN(pool);
  }
}
