import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-apy',
  templateUrl: './apy.component.html',
  styleUrls: ['./apy.component.scss']
})
export class ApyComponent implements OnInit {

  rewardDaily: number;
  rewardWeekly: number;
  rewardMonthly: number;
  rewardYearly: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private router: Router

  ) { }

  ngOnInit(): void {
  }

  buy(tokenFirst, tokenSecond): void{
    this.router.navigate(['pages/wallet/' + tokenFirst + '/' + tokenSecond ]);
  }

}
