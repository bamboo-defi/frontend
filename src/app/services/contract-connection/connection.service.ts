import { Injectable } from '@angular/core';
import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { Subject, Subscription } from 'rxjs';
import Web3Modal from './tools/Web3Modal.js';
import { environment } from 'src/environments/environment.js';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {

  public web3js: any;
  public provider: any;
  public accounts: any;
  web3Modal;

  private accountStatusSource = new Subject<any>();
  accountStatus$ = this.accountStatusSource.asObservable();

  constructor() {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: environment.infuraId
        }
      }
    };

    this.web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
      providerOptions,
    });
  }


  public async connectAccount(): Promise<any>  {
    this.web3Modal.clearCachedProvider();

    this.provider = await this.web3Modal.connect(); // set provider
    this.web3js = new Web3(this.provider); // create web3 instance
    this.accounts = await this.web3js.eth.getAccounts();
    this.accountStatusSource.next(this.accounts);

    window['ethereum'].on('accountsChanged', async (accounts) => {
      this.web3js = new Web3(this.provider); // create web3 instance
      this.accounts = await this.web3js.eth.getAccounts();
    });


  }
  public async syncAccount(): Promise<any> {
    if (!this.provider) {
      console.log('Please connect your wallet');
    }
  }

  public async lastBlockTimestamp(): Promise<number>{
    await this.syncAccount();
    const blockInfo = await this.web3js.eth.getBlock('latest');
    return blockInfo.timestamp;
  }

  public async lastBlockNumber(): Promise<number>{
    await this.syncAccount();
    return await this.web3js.eth.getBlockNumber();
  }

  public async getETHBalance(addr: string = '0x'): Promise<string>{
    if (addr === '0x'){
      addr = this.accounts[0];
    }
    return await this.web3js.eth.getBalance(addr);
  }

  public async validateAddress(addr: string): Promise<boolean>{
    return this.web3js.utils.isAddress(addr);
  }
}
