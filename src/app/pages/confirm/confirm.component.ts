import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent implements OnInit {

  ok = true;
  noDeal = false;
  toTrade: boolean;
  liquidityPlus: boolean;
  toStake: boolean;
  liquidityMinus: boolean;
  raindrop: boolean;
  bbyp: boolean;
  bambooField: boolean;
  withdraw: boolean;
  claim: boolean;
  withdrawStaking: boolean;
  withdrawAccumulated: boolean;
  createPair: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data
  ) {
  }

  ngOnInit(): void {
    if (this.data.name === 'to-trade') {
      this.toTrade = !!(this.data.toAmmount &&
        this.data.toName &&
        this.data.fromAmmount &&
        this.data.fromName);
    }
    this.liquidityPlus = this.data.name === 'liquidity-plus';
    this.toStake = this.data.name === 'toStake';
    this.liquidityMinus = this.data.name === 'liquidityMinus';
    this.raindrop = this.data.name === 'raindrop';
    this.bbyp = this.data.name === 'bbyp';
    this.bambooField = this.data.name === 'bambooField';
    this.withdraw = this.data.name === 'withdraw';
    this.claim = this.data.name === 'claim';
    this.withdrawStaking = this.data.name === 'withdrawStaking';
    this.withdrawAccumulated = this.data.name === 'withdrawAcumulated';
    this.createPair = this.data.name === 'createPair';
  }
}
