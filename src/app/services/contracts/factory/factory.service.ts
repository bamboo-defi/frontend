import { Injectable } from '@angular/core';
import {ConnectionService} from '../../contract-connection/connection.service';
const FactoryAbi = require('../abi/UniswapV2Factory.json');
import {NetworkService} from 'src/app/services/contract-connection/network.service';

@Injectable({
  providedIn: 'root'
})
export class FactoryService {

  addresses;

  constructor(
    private connService: ConnectionService,
    private networkService: NetworkService
  ) {
    this.addresses = networkService.getAddressNetwork();
  }

  // Function to get a pair of tokens
  public async getPair(tokenA: string, tokenB: string): Promise<string>{
    await this.connService.syncAccount();
    const factory  = new this.connService.web3js.eth.Contract(FactoryAbi, this.addresses.factory_address);
    // returns address
    const addr = await factory.methods.getPair(tokenA, tokenB).call({from: this.connService.accounts[0]});
    return addr.toString();
  }

  // Function for pair creation
  public async createPair(tokenA: string, tokenB: string): Promise<string>{
    await this.connService.syncAccount();
    const factory  = new this.connService.web3js.eth.Contract(FactoryAbi, this.addresses.factory_address);
    // returns address
    const addr = await factory.methods.createPair(tokenA, tokenB).send({from: this.connService.accounts[0]});
    return addr.toString();
  }
}
