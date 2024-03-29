import { Injectable } from '@angular/core';
import { ConnectionService } from '../../contract-connection/connection.service';
import BigNumber from 'bignumber.js';
import { TokenData, TokenDataDetail } from '../../../interfaces/contracts';
import { UtilService } from '../utils/util.service';
const ERC20Abi = require('../abi/ERC20.json');
import {NetworkService} from 'src/app/services/contract-connection/network.service';
import { MaxUint256 } from '@ethersproject/constants';
import { ServiceService } from '../../service.service';
import {environment} from '../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class TokenService {

  addresses;

  constructor(
    private connService: ConnectionService,
    private utils: UtilService,
    private service: ServiceService,
    private networkService: NetworkService
  ) {
    this.addresses = networkService.getAddressNetwork();
  }

  // Returns the balance of the address
  public async getBalance(tokenAddr: string, addr: string = '0x'): Promise<string> {
    await this.connService.syncAccount();
    if (addr === '0x') {
      addr = this.connService.accounts[0];
    }
    const token = new this.connService.web3js.eth.Contract(ERC20Abi, tokenAddr);
    const balance = await token.methods.balanceOf(addr).call({ from: this.connService.accounts[0] });
    return balance.toString();
  }

  // Function for approves a transaction
  public async approve(tokenInfo: TokenData, approveAddr: string, amount?: BigNumber): Promise<any> {
    await this.connService.syncAccount();
    let stringAmount;
    if (amount === undefined) {
      stringAmount = MaxUint256.toString();
    }
    else {
      stringAmount = this.utils.fromBNtoWei(amount, tokenInfo.decimals);
    }
    const token = new this.connService.web3js.eth.Contract(ERC20Abi, tokenInfo.addr);
    const receipt = await token.methods.approve(approveAddr, stringAmount)
      .send({ from: this.connService.accounts[0] });
    return receipt;
  }

  public async getSupply(tokenAddr: string): Promise<string> {
    await this.connService.syncAccount();
    const token = new this.connService.web3js.eth.Contract(ERC20Abi, tokenAddr);
    const supply = await token.methods.totalSupply().call({ from: this.connService.accounts[0] });
    return supply.toString();
  }

  public async getAllowance(tokenAddr: string, spender: string, owner: string = '0x'): Promise<string> {
    await this.connService.syncAccount();
    if (owner === '0x') {
      owner = this.connService.accounts[0];
    }
    const token = new this.connService.web3js.eth.Contract(ERC20Abi, tokenAddr);
    const allowance = await token.methods.allowance(owner, spender).call({ from: this.connService.accounts[0] });
    return allowance.toString();
  }

  public async getTokenDBData(tokenAddr: string): Promise<TokenData> {
    return new Promise(async (resolve) => {
      this.service.getTokenDataDB(tokenAddr).subscribe(
        async (res) => {
          resolve({
            balance: this.utils.fromWeiToBN('0'),
            addr: tokenAddr,
            decimals: res.token.decimals,
            isEth: false
          });
        }
      );
    });
  }

  // Gets info about the token
  public async getTokenData(tokenAddr: string, isEth: boolean = false, userAddr: string = '0x'): Promise<TokenData> {
    await this.connService.syncAccount();
    if (this.connService.web3js !== undefined) {
      const token = new this.connService.web3js.eth.Contract(ERC20Abi, tokenAddr);
      if (userAddr === '0x') {
        userAddr = this.connService.accounts[0];
      }
      if (isEth) {
        return {
          balance: this.utils.fromWeiToBN(await this.connService.getETHBalance()),
          addr: this.addresses.weth_address,
          decimals: 18,
          isEth: true
        };
      }
      const userBalance = await token.methods.balanceOf(userAddr).call({ from: this.connService.accounts[0] });
      const tokenDecimals = await token.methods.decimals().call({ from: this.connService.accounts[0] });
      return {
        balance: this.utils.fromWeiToBN(userBalance, parseInt(tokenDecimals, 10)),
        addr: tokenAddr,
        decimals: parseInt(tokenDecimals, 10),
        isEth: false
      };
    }
  }

  // Get all general data of pair, but no balance
  public async getDetailedTokenData(tokenAddr: string, isEth: boolean = false): Promise<TokenDataDetail> {
    await this.connService.syncAccount();
    const token = new this.connService.web3js.eth.Contract(ERC20Abi, tokenAddr);
    if (isEth) {
      return {
        name: 'WETH',
        addr: this.addresses.weth_address,
        decimals: 18,
        isEth: true
      };
    }
    const symbol = await token.methods.symbol().call({ from: this.connService.accounts[0] });
    const tokenDecimals = await token.methods.decimals().call({ from: this.connService.accounts[0] });
    return {
      name: symbol,
      addr: tokenAddr,
      decimals: parseInt(tokenDecimals, 10),
      isEth: false
    };
  }

  public async getDecimals(tokenAddr: string): Promise<number> {
    await this.connService.syncAccount();
    const token = new this.connService.web3js.eth.Contract(ERC20Abi, tokenAddr);
    return await token.methods.decimals().call({ from: this.connService.accounts[0] });
  }

  public async getBAMBOOData(userAddr: string = '0x'): Promise<TokenData> {
    return await this.getTokenData(this.addresses.bambooToken_address, false, userAddr);
  }

  public async getWETHData(userAddr: string = '0x'): Promise<TokenData> {
    return await this.getTokenData(this.addresses.weth_address, false, userAddr);
  }

  public async getSeedData(userAddr: string = '0x'): Promise<TokenData> {
    return await this.getTokenData(this.addresses.bambooField_address, false, userAddr);
  }

  public async getSeedBambooBalance(): Promise<BigNumber> {
    const seddBambooBalance = await this.getBalance(this.addresses.bambooToken_address, this.addresses.bambooField_address);
    return this.utils.fromWeiToBN(seddBambooBalance);
  }

  public isEth(address, name): boolean {
    return name === environment.net && this.utils.compareEthAddr(address, this.addresses.weth_address);
  }
}
