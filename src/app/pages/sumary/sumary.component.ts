import { Component, OnInit } from '@angular/core';
import { Bamboo } from 'src/app/interfaces/bamboo';
import {ServiceService} from '../../services/service.service';

@Component({
  selector: 'app-sumary',
  templateUrl: './sumary.component.html',
  styleUrls: ['./sumary.component.scss']
})
export class SumaryComponent implements OnInit {

  bamboo: Bamboo;

  constructor(private service: ServiceService) { }

  ngOnInit(): void {

    this.bamboo = {
      valor: 0.00,
      porcentaje: 0.00,
      liquidity: 0.00,
      porcentajeLiquidity: 0.00,
      fees: 0.0,
    };
    this.getValuesForBamboo();
  }

  async getValuesForBamboo(): Promise<void> {
    this.service.getBambooGlobalMarket().subscribe(
      res => {
        this.bamboo.valor = res.market.bambooPrice;
        this.bamboo.liquidity = res.market.bambooLiquidity;
        this.bamboo.fees = res.market.bambooFeesDay;
      }
    );
  }

}
