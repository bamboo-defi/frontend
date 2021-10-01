import {Injectable} from '@angular/core';
import * as ADDRESSES from './tools/addresses';
import * as KOVAN_ADDRESSES from './tools/kovanAddresses';
import * as RINKEBY_ADDRESSES from './tools/rinkebyAddresses';
import * as TESTNET_ADDRESSES from './tools/testnetAddresses';
import * as VELAS_TESTNET_ADDRESSES from './tools/testnetVelasAddresses';
import * as BSC_ADDRESSES from './tools/bscAddresses';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  addresses = ADDRESSES;
  heroku;

  constructor() {
  }

  public getAddressNetwork(): any {
    switch (environment.network) {
      case 'mainnet': {
        this.addresses = ADDRESSES;
        break;
      }
      case 'kovan': {
        this.addresses = KOVAN_ADDRESSES;
        break;
      }
      case 'rinkeby': {
        this.addresses = RINKEBY_ADDRESSES;
        break;
      }
      case 'testnet': {
        this.addresses = TESTNET_ADDRESSES;
        break;
      }
      case 'bsc': {
        this.addresses = BSC_ADDRESSES;
        break;
      }
      case 'velas-testnet': {
        this.addresses = VELAS_TESTNET_ADDRESSES;
        break;
      }
      default: {
        this.addresses = ADDRESSES;
        break;
      }
    }
    return this.addresses;
  }

  public getHerokuNetwork(): string {
    switch (environment.network) {
      case 'mainnet': {
        this.heroku = environment.herokuMainnet;
        break;
      }
      case 'kovan': {
        break;
      }
      case 'testnet': {
        break;
      }
      case 'bsc': {
        this.heroku = environment.herokuBSC;
        break;
      }
      case 'velas-testnet': {
        break;
      }
      default: {
        this.heroku = environment.herokuMainnet;
        break;
      }
    }
    return this.heroku;
  }
}
