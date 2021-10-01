import { Injectable } from '@angular/core';
import {ConnectionService} from '../../contract-connection/connection.service';
import BigNumber from 'bignumber.js';
import {BambooStakeBonus, DepositInfo, TokenData} from '../../../interfaces/contracts';
import {NetworkService} from 'src/app/services/contract-connection/network.service';
import {UtilService} from '../utils/util.service';
const KeeperAbi = require('../abi/ZooKeeper.json');


@Injectable({
  providedIn: 'root'
})
export class KeeperService {

  addresses;

  constructor(
    private connService: ConnectionService,
    private utils: UtilService,
    private networkService: NetworkService
  ) {
    this.addresses = networkService.getAddressNetwork();
  }

  // Externally provide the ID of active pools
  public async depositLP(poolId: string, lpAmount: BigNumber, lpToken: TokenData): Promise<any> {
    await this.connService.syncAccount();
    const keeper  = new this.connService.web3js.eth.Contract(KeeperAbi, this.addresses.zooKeeper_address);
    console.log('KeeperAbi', KeeperAbi);
    return await keeper.methods.deposit(poolId, this.utils.fromBNtoWei(lpAmount, lpToken.decimals))
      .send({from: this.connService.accounts[0]});
  }

  // Liquidity pool withdrawal request
  public async withdrawLP(poolId: string, lpAmount: BigNumber, lpToken: TokenData): Promise<any> {
    await this.connService.syncAccount();
    const keeper  = new this.connService.web3js.eth.Contract(KeeperAbi, this.addresses.zooKeeper_address);
    return await keeper.methods.withdraw(poolId, this.utils.fromBNtoWei(lpAmount, lpToken.decimals))
      .send({from: this.connService.accounts[0]});
  }

  // Obtains the staked liquidity pool tokens
  public async getStakedLP(poolId: string, lpToken: TokenData): Promise<BigNumber> {
    await this.connService.syncAccount();
    const keeper  = new this.connService.web3js.eth.Contract(KeeperAbi, this.addresses.zooKeeper_address);
    const userInfo = await keeper.methods.userInfo(poolId, this.connService.accounts[0])
      .call({from: this.connService.accounts[0]});
    return this.utils.fromWeiToBN(userInfo.amount, lpToken.decimals);
  }

  // Function for deposit bamboo
  public async depositBamboo(amount: BigNumber, stakeTime: number): Promise<any> {
    await this.connService.syncAccount();
    const keeper  = new this.connService.web3js.eth.Contract(KeeperAbi, this.addresses.zooKeeper_address);
    return await keeper.methods.depositBamboo(this.utils.fromBNtoWei(amount), stakeTime.toString())
      .send({from: this.connService.accounts[0]});
  }

  // Get a list of active depositsIds from a user
  public async getDeposits(userAddr: string = '0x'): Promise<any[]> {
    await this.connService.syncAccount();
    if (userAddr === '0x'){
      userAddr = this.connService.accounts[0];
    }
    const keeper  = new this.connService.web3js.eth.Contract(KeeperAbi, this.addresses.zooKeeper_address);
    return await keeper.methods.getDeposits(userAddr).call({from: this.connService.accounts[0]});
  }

  // Obtain information on the amount of bamboo deposited.
  public async getDepositInfo(depositId: string, userAddr: string = '0x'): Promise<DepositInfo> {
    await this.connService.syncAccount();
    if (userAddr === '0x'){
      userAddr = this.connService.accounts[0];
    }
    const keeper  = new this.connService.web3js.eth.Contract(KeeperAbi, this.addresses.zooKeeper_address);
    const receipt = await keeper.methods.getDepositInfo(userAddr, depositId).call({from: this.connService.accounts[0]});
    return {
      amount: this.utils.fromWeiToBN(receipt[0].toString()),
      withdrawTime: receipt[1].toString()
    };
  }

  // Get the user's staked amount
  public async getTotalStakedAmount(): Promise<BigNumber> {
    const userAddr = this.connService.accounts[0];
    await this.connService.syncAccount();
    const keeper  = new this.connService.web3js.eth.Contract(KeeperAbi, this.addresses.zooKeeper_address);
    const totalAm = await keeper.methods.bambooUserInfo(userAddr).call({from: this.connService.accounts[0]});
    return this.utils.fromWeiToBN(totalAm);
  }

  // Validate that the staketime has finished on frontend
  public async withdrawBamboo(depositId: string): Promise<any> {
    await this.connService.syncAccount();
    const keeper  = new this.connService.web3js.eth.Contract(KeeperAbi, this.addresses.zooKeeper_address);
    return await keeper.methods.withdrawBamboo(depositId).send({from: this.connService.accounts[0]});
  }

  // Withdraw daily bamboo rewards from staking
  public async withdrawDailyBamboo(depositId: string): Promise<any> {
    await this.connService.syncAccount();
    const keeper  = new this.connService.web3js.eth.Contract(KeeperAbi, this.addresses.zooKeeper_address);
    return await keeper.methods.withdrawDailyBamboo(depositId).send({from: this.connService.accounts[0]});
  }

  // Returns total amount of pending bamboo to claim in the future, and the amount available to claim at the moment.
  // From BambooXBamboo Staking
  public async getPendingStakeBAMBOO(depositId: string, userAddr: string = '0x'): Promise<BambooStakeBonus> {
    await this.connService.syncAccount();
    if (userAddr === '0x'){
      userAddr = this.connService.accounts[0];
    }
    const keeper  = new this.connService.web3js.eth.Contract(KeeperAbi, this.addresses.zooKeeper_address);
    const pending = await keeper.methods.pendingStakeBamboo(depositId, userAddr).call({from: this.connService.accounts[0]});
    return{
      claimableNow: this.utils.fromWeiToBN(pending[1].toString()),
      claimableFuture: this.utils.fromWeiToBN(pending[0].toString())
    };
  }

  // From LP Staking
  public async getPendingBAMBOO(poolId: string, userAddr: string = '0x'): Promise<BigNumber> {
    await this.connService.syncAccount();
    if (userAddr === '0x'){
      userAddr = this.connService.accounts[0];
    }
    const keeper  = new this.connService.web3js.eth.Contract(KeeperAbi, this.addresses.zooKeeper_address);
    const pending = await keeper.methods.pendingBamboo(poolId, userAddr).call({from: this.connService.accounts[0]});
    return this.utils.fromWeiToBN(pending);
  }

  // Returns the stake multiplier for the different lock times
  async getStakeMultiplier(amount: BigNumber, lockTime: number): Promise<string> {
    await this.connService.syncAccount();
    const keeper  = new this.connService.web3js.eth.Contract(KeeperAbi, this.addresses.zooKeeper_address);
    const pending = await keeper.methods.getStakingMultiplier(lockTime.toString(), this.utils.fromBNtoWei(amount)).call({from: this.connService.accounts[0]});
    return (Number(pending) / 10000).toString();
  }
}
