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
  withdrawAcumulated: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data
  ) {
  }

  ngOnInit(): void {
    if (this.data.name === 'to-trade') {
      if (
        this.data.toAmmount &&
        this.data.toName &&
        this.data.fromAmmount &&
        this.data.fromName
      ) {
        this.toTrade = true;
      } else {
        this.toTrade = false;
      }
    }
    if (this.data.name === 'liquidity-plus') {
      this.liquidityPlus = true;
    } else {
      this.liquidityPlus = false;
    }
    if (this.data.name === 'toStake') {
      this.toStake = true;
    } else {
      this.toStake = false;
    }
    if (this.data.name === 'liquidityMinus') {
      this.liquidityMinus = true;
    } else {
      this.liquidityMinus = false;
    }
    if (this.data.name === 'raindrop') {
      this.raindrop = true;
    } else {
      this.raindrop = false;
    }
    if (this.data.name === 'bbyp') {
      this.bbyp = true;
    } else {
      this.bbyp = false;
    }
    if (this.data.name === 'bambooField') {
      this.bambooField = true;
    } else {
      this.bambooField = false;
    }
    if (this.data.name === 'withdraw') {
      this.withdraw = true;
    } else {
      this.withdraw = false;
    }
    if (this.data.name === 'claim') {
      this.claim = true;
    } else {
      this.claim = false;
    }
    if (this.data.name === 'withdrawStaking') {
      this.withdrawStaking = true;
    } else {
      this.withdrawStaking = false;
    }
    if (this.data.name === 'withdrawAcumulated') {
      this.withdrawAcumulated = true;
    } else {
      this.withdrawAcumulated = false;
    }
  }
}
