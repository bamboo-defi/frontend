import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PandaspinnerComponent } from './pandaspinner.component';

@Injectable() export class PandaSpinnerService {

  constructor(private dialog: MatDialog) { }

  dialogRef: MatDialogRef<PandaspinnerComponent>;

  public open(): void {
    this.dialogRef = this.dialog.open(PandaspinnerComponent, {
      closeOnNavigation: false,
      disableClose: true,
      panelClass: 'panda-spinner'
    });
  }

  public close(): void {
    this.dialogRef.close();
  }
}
