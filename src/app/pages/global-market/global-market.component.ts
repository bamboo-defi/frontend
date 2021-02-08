import { Component, OnInit } from '@angular/core';
import {GlobalMarket} from '../../interfaces/global-market';
import {ServiceService} from '../../services/service.service';

@Component({
  selector: 'app-global-market',
  templateUrl: './global-market.component.html',
  styleUrls: ['./global-market.component.scss']
})
export class GlobalMarketComponent implements OnInit {

  globalMarket: GlobalMarket = {
    currentPrice: 0,
    ath: 0,
    athPercentage: 0,
    atl: 0,
    atlPercentage: 0,
    marketCap: 0,
    totalVolume: 0,
    high24: 0,
    low24: 0,
    priceChange24: 0,
    priceChange24Percentage: 0,
    totalSupply: 0,
    circulatingSupply: 0
  };
  constructor(private service: ServiceService) { }

  ngOnInit(): void {
    this.service.getBambooGlobalMarket().subscribe(
      res => {
        this.globalMarket.currentPrice = res.market_data.current_price.usd;
        this.globalMarket.ath = res.market_data.ath.usd;
        this.globalMarket.athPercentage = res.market_data.ath_change_percentage.usd;
        this.globalMarket.atl = res.market_data.atl.usd;
        this.globalMarket.atlPercentage = res.market_data.atl_change_percentage.usd;
        this.globalMarket.marketCap = res.market_data.market_cap.usd;
        this.globalMarket.totalVolume = res.market_data.total_volume.usd;
        this.globalMarket.high24 = res.market_data.high_24h.usd;
        this.globalMarket.low24 = res.market_data.low_24h.usd;
        this.globalMarket.priceChange24 = res.market_data.price_change_24h_in_currency.usd;
        this.globalMarket.priceChange24Percentage = res.market_data.price_change_percentage_24h;
        this.globalMarket.totalSupply = res.market_data.total_supply;
        this.globalMarket.circulatingSupply = res.market_data.circulating_supply;
      }
    );
  }

}
