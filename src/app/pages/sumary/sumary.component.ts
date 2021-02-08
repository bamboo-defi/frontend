import { Component, OnInit } from '@angular/core';
import { Bamboo } from 'src/app/interfaces/bamboo';
import { ContractService } from 'src/app/services/contracts/contract.service';

@Component({
  selector: 'app-sumary',
  templateUrl: './sumary.component.html',
  styleUrls: ['./sumary.component.scss']
})
export class SumaryComponent implements OnInit {

  bamboo: Bamboo;

  constructor(private contractService: ContractService) { }

  ngOnInit(): void {

    this.bamboo = {
      valor: 0.00,
      porcentaje: 0.00,
      liquidity: 0.00,
      porcentajeLiquidity: 0.00,
      fees: 0.0,
    };
    //this.getValuesForBamboo();
  }

  async getValuesForBamboo(): Promise<void> {
    this.bamboo.valor = await this.contractService.getBambooValueInUSDT();
    this.bamboo.liquidity = await this.contractService.getLiquidityInUSDT();
  }

}
