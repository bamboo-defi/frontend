import { Injectable } from '@angular/core';
import {ConnectionService} from '../../contract-connection/connection.service';
import {UtilService} from '../utils/util.service';
const FieldAbi = require('../abi/BambooField.json');
import {NetworkService} from 'src/app/services/contract-connection/network.service';
import BigNumber from 'bignumber.js';
import {FieldUserInfo} from '../../../interfaces/contracts';


@Injectable({
  providedIn: 'root'
})
export class FieldService {

  addresses;

  constructor(
    private connService: ConnectionService,
    private utils: UtilService,
    private networkService: NetworkService
  ) {
    this.addresses = networkService.getAddressNetwork();
  }

  // Bamboo storage operation
  public async depositBamboo(poolId: string, amount: BigNumber): Promise<any> {
    await this.connService.syncAccount();
    const field = new this.connService.web3js.eth.Contract(FieldAbi, this.addresses.bambooField_address);
    return await field.methods.register(poolId, this.utils.fromBNtoWei(amount)).send({from: this.connService.accounts[0]});
  }

  // Request a bamboo removal operation
  public async withdrawBamboo(): Promise<any> {
    await this.connService.syncAccount();
    const field = new this.connService.web3js.eth.Contract(FieldAbi, this.addresses.bambooField_address);
    return await field.methods.withdraw().send({from: this.connService.accounts[0]});
  }

  // Buy as many shares as possible with bambooAmount
  public async buySeeds(amount: BigNumber): Promise<any> {
    await this.connService.syncAccount();
    const field = new this.connService.web3js.eth.Contract(FieldAbi, this.addresses.bambooField_address);
    return await field.methods.buy(this.utils.fromBNtoWei(amount)).send({from: this.connService.accounts[0]});
  }

  // Burn shares for bambooValue
  public async harvestSeeds(shareAmount: BigNumber): Promise<any> {
    await this.connService.syncAccount();
    const field = new this.connService.web3js.eth.Contract(FieldAbi, this.addresses.bambooField_address);
    return await field.methods.harvest(this.utils.fromBNtoWei(shareAmount)).send({from: this.connService.accounts[0]});
  }

  // Obtain registration cost
  public async getRegisterCost(): Promise<BigNumber> {
    await this.connService.syncAccount();
    const field = new this.connService.web3js.eth.Contract(FieldAbi, this.addresses.bambooField_address);
    const amount = await field.methods.registerAmount().call({from: this.connService.accounts[0]});
    return this.utils.fromWeiToBN(amount);
  }

  // Check if user is registerd and active
  public async getUserInfo(userAddr: string = '0x'): Promise<FieldUserInfo> {
    await this.connService.syncAccount();
    if (userAddr === '0x'){
      userAddr = this.connService.accounts[0];
    }
    const field = new this.connService.web3js.eth.Contract(FieldAbi, this.addresses.bambooField_address);
    const userInfo = await field.methods.userInfo(userAddr).call({from: this.connService.accounts[0]});
    return {
      isActive: userInfo.active,
      poolId: userInfo.poolId,
      startTime: userInfo.startTime,
      endTime: userInfo.endTime,
      amount: this.utils.fromWeiToBN(userInfo.amount)
    };
  }

  // Estimate the current seed price. Need to send the current bambooBalance of the contract
  public async estimateSeedValue(bambooBalance: BigNumber): Promise<BigNumber> {
    await this.connService.syncAccount();
    const field = new this.connService.web3js.eth.Contract(FieldAbi, this.addresses.bambooField_address);
    const totalShares = await field.methods.totalSupply().call({from: this.connService.accounts[0]});
    const deposited = await field.methods.depositPool().call({from: this.connService.accounts[0]});
    const totalBamboo = bambooBalance.minus(this.utils.fromWeiToBN(deposited));
    return this.utils.fromWeiToBN(totalShares).dividedBy(totalBamboo);

  }

  // Estimate the current seed price. Need to send the current bambooBalance of the contract
  public async minStakeTime(): Promise<number> {
    await this.connService.syncAccount();
    const field = new this.connService.web3js.eth.Contract(FieldAbi, this.addresses.bambooField_address);
    return Number(await field.methods.minStakeTime().call({from: this.connService.accounts[0]}));
  }

}
