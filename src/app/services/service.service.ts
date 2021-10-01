import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {environment} from 'src/environments/environment';
import {Pool} from '../interfaces/pool';
import {NetworkService} from './contract-connection/network.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  geckoApi = environment.geckoApi;
  tokens = environment.tokensSupportedString;
  feed = environment.feed;
  listTokens = [];
  etherscanToken = environment.etherscan;
  herokuAPI;// = !environment.kovan ? environment.herokuMainnet : environment.herokuKovan;

  constructor(
    private http: HttpClient,
    private router: Router,
    private networkService: NetworkService
  ) {
    this.herokuAPI = networkService.getHerokuNetwork();
  }

  private data: Pool;

  // Get tokens in market
  getTokensMarket(): any {
    return this.http.get<JSON>(this.geckoApi + '/coins/markets?vs_currency=usd&ids=' + this.tokens + '&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h');
  }

  // Get market token detail
  getTokenMarket(token): any {
    return this.http.get<JSON>(this.geckoApi + '/coins/' + token + '?tickers=true&market_data=true&community_data=true&developer_data=true&sparkline=true');
  }

  // Get the token price
  getTokenPriceInUSDT(token): any {
    return this.http.get<JSON>(this.geckoApi + '/coins/markets/?vs_currency=usd&ids=' + token);
  }

  // Get token JSON list
  getTokenList(): any {
    return this.http.get<JSON>('https://www.coingecko.com/tokens_list/uniswap/defi_100/v_0_0_0.json');
  }

  // Get Token list for Bamboo
  getTokenListBamboo(): any {
    return this.http.get<JSON>(this.herokuAPI + 'token-data/getTokens');
  }

  // Get Pool list
  getPoolList(): any {
    return this.http.get<JSON>(this.herokuAPI + 'pools/getPools');
  }

  // Get Pair list
  getPairList(): any {
    return this.http.get<JSON>(this.herokuAPI + 'pairs/getPairs');
  }

  // Get Medium feed
  getMediumFeed(): any {
    return this.http.get<JSON>(this.feed);
  }

  // Get transaction list
  getTransactionList(address: string, from: string, to: string): any {
    const query = 'https://api.etherscan.io/api?module=account&action=txlist&address='.concat(address, '&startblock=',
      from, '&endblock=', to, '&sort=desc&apikey=', this.etherscanToken);
    return this.http.get<JSON>(query);
  }

  // Get Bamboo Global Market Data
  getBambooGlobalMarket(): any {
    return this.http.get<JSON>(this.herokuAPI + 'market/getMarket');
  }

  public getPairDataDB(address: string): any {
    return this.http.get<JSON>(this.herokuAPI + 'pairs/getPairByAddress/' + address);
  }

  public getPairDataDBID(id: string): any {
    return this.http.get<JSON>(this.herokuAPI + 'pairs/getPair/' + id);
  }

  public getPairDataDBAddresses(token1: string, token2): any {
    return this.http.get<JSON>(this.herokuAPI + 'pairs/getPairByAddresses/' + token1 + '/' + token2);
  }

  public getTokenDataDB(address: string): any {
    return this.http.get<JSON>(this.herokuAPI + 'token-data/getToken/' + address);
  }

  public getTxDBData(pairId: string): any {
    return this.http.get<JSON>(this.herokuAPI + 'transactions/getList/' + pairId);
  }

  public getTxAddressDBData(address: string): any {
    return this.http.get<JSON>(this.herokuAPI + 'transactions/getListAddress/' + address);
  }

  public getBambooVault(): any {
    return this.http.get<JSON>(this.herokuAPI + 'bamboo-vault/getVault');
  }

  public createPair(token1: string, token2: string): any {
    const body = new HttpParams();
    body.set('token1', token1);
    body.set('token2', token2);
    return this.http.post<any>(this.herokuAPI + 'pairs/createPairFront', {token1, token2}).subscribe();
  }

  // Pair service between Pool and Pair
  setPair(data): void {
    this.data = data;
  }

  getPair(): Pool {
    const temp = this.data;
    this.clearPair();
    return temp;
  }

  clearPair(): void {
    this.data = undefined;
  }
}
