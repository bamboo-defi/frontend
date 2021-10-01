import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {

  hasBridge = environment.bridge;
  liquidityPlusActive = 0;
  pairAddressToken1: string = this.route.snapshot.paramMap.get('id1');
  pairAddressToken2: string = this.route.snapshot.paramMap.get('id2');
  fromLiquidityMinus: string = this.route.snapshot.paramMap.get('pool');
  hasLiquidityPlus = false;

  constructor(
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    if (this.pairAddressToken1 && this.pairAddressToken2) {
      this.liquidityPlusActive = 1;
      this.hasLiquidityPlus = true;
    }
    if (this.fromLiquidityMinus) {
      this.liquidityPlusActive = 2;
    }
  }

}
