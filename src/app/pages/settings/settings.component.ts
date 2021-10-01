import { Component, OnInit, ViewChild } from '@angular/core';
import { MatAccordion, MatExpansionPanel } from '@angular/material/expansion';
import { Settings } from 'src/app/interfaces/settings';
import { Slippage } from 'src/app/interfaces/slippage';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  settings: Settings = {
    slipTolerance : 2,
    transDeadLine : 60
  };

  slippages: Slippage[] = [
    {value: 1},
    {value: 2},
    {value: 5},
    {value: 10},
  ];

  fromValuePercentaje = [
   {value: 25},
   {value: 50},
   {value: 100},
 ];

 error = false;

 @ViewChild(MatExpansionPanel) accordion: MatExpansionPanel;

  constructor() {}

  ngOnInit(): void {
    this.openSettings();
  }

  // Set slippage tolerance to selected percentage
  loadSlip(data): number{
    return this.settings.slipTolerance = data;
}

  // If +100% returns 100
  maxCien(): number {
    if (this.settings.slipTolerance >= 100){
      this.settings.slipTolerance = 100;
      return this.settings.slipTolerance;
    }
  }

  // Open settings accordion, select values from localStorage or, in case, hardcoded values
  openSettings(): void{
    if (!localStorage.getItem('slippage')) {
      this.settings.slipTolerance = 2;
    } else {
      this.settings.slipTolerance  = +localStorage.getItem('slippage');
    }
    if (!localStorage.getItem('transDeadLine')) {
      this.settings.transDeadLine = 60;
    } else {
      this.settings.transDeadLine  = +localStorage.getItem('transDeadLine');
    }
  }

  // On submit settings
  onSubmit(): void{
    if (this.settings.transDeadLine > 0){
    this.error = false;
    const sliptolerance = String(this.settings.slipTolerance);
    const transDeadLine = String(this.settings.transDeadLine);

    localStorage.setItem('slippage', sliptolerance);
    localStorage.setItem('transDeadLine', transDeadLine);
    this.accordion.close();
      }else{
        this.error = true;
        return;
    }
}
}
