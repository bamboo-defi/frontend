import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog} from '@angular/material/dialog';
import { PandaSpinnerService } from './pandaspinner.service';

@Component({
  selector: 'app-pandaspinner',
  templateUrl: './pandaspinner.component.html',
  styleUrls: ['./pandaspinner.component.scss']
})
export class PandaspinnerComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private matDialogRef: MatDialogRef<PandaspinnerComponent>,
    private dialog: MatDialog) {
  }

  ngOnInit(): void {
  }


  public closeAllDialogs(): void{
    this.dialog.closeAll();
  }

}
