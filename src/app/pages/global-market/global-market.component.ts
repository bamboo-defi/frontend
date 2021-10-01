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
        this.globalMarket.currentPrice = res.market.cgCurrentPrice;
        this.globalMarket.ath = res.market.cgATH;
        this.globalMarket.athPercentage = res.market.cgATHPercentage;
        this.globalMarket.atl = res.market.cgATL;
        this.globalMarket.atlPercentage = res.market.cgATLPercentage;
        this.globalMarket.marketCap = res.market.cgMarketCap;
        this.globalMarket.totalVolume = res.market.cgTotalVolume;
        this.globalMarket.high24 = res.market.cg24High;
        this.globalMarket.low24 = res.market.cg24Low;
        this.globalMarket.priceChange24 = res.market.cg24Change;
        this.globalMarket.priceChange24Percentage = res.market.cg24ChangePercentage;
        this.globalMarket.totalSupply = res.market.bambooTotalSupply;
        this.globalMarket.circulatingSupply = res.market.cgCirculatingSupply;
      }
    );
  }

}
