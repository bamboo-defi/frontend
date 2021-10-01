// import { Component, Input, OnInit } from '@angular/core';
// import { MatDialog } from '@angular/material/dialog';
// import { Unwrap } from 'src/app/interfaces/unwrap';
// import { Wrap } from 'src/app/interfaces/wrap';
// import { WrapdialogComponent } from '../wrapdialog/wrapdialog.component';
// import { UnwrapdialogComponent } from '../unwrapdialog/unwrapdialog.component';

// @Component({
//   selector: 'app-token-wrapped',
//   templateUrl: './token-wrapped.component.html',
  // styleUrls: ['./token-wrapped.component.scss']
// })
// export class TokenWrappedComponent implements OnInit {

  // @Input() account;
  // @Input() wrapName;

  // wrap: Wrap = {
  //   addressEth: '',
  //   addressToken: ''
  // };
  // unwrap: Unwrap = {
  //   addressToken: '',
  //   ammountToken: ''
  // };
  // constructor(
    // public wrapDialog: MatDialog,
    // public unWrapDialog: MatDialog,
  // ) { }

  // ngOnInit(): void {
    // console.log(this.wrapName);
  // }

  // wrapSubmit(): void {
  //   console.log('wrap submit');
  //   const dataAddress = {
  //     address: this.wrap.addressEth
  //   };
  //   const dialogRef = this.wrapDialog.open(WrapdialogComponent, {
  //     width: '380px',
  //     data: dataAddress
  //   });
  //   dialogRef.afterClosed().subscribe(result => {
  //     this.wrap = {
  //       addressEth: '',
  //       addressToken: ''
  //     };
  //     console.log('dialog cerrado - crear cartera');
  //   });
  // }

  // unwrapSubmit(): void {
  //   console.log('unwrap submit');
  //   const dataUnwrap = {
  //     tokenAddress: this.unwrap.addressToken,
  //     ammount: this.unwrap.ammountToken,
  //     token: this.wrapName
  //   };
  //   console.log(dataUnwrap.token);
  //   const dialogRef = this.unWrapDialog.open(UnwrapdialogComponent, {
  //     width: '380px',
  //     data: dataUnwrap
  //   });
  //   dialogRef.afterClosed().subscribe(result => {
  //     this.unwrap = {
  //       addressToken: '',
  //       ammountToken: ''
  //     };
  //     console.log('dialog cerrado - unwrap ammount');
  //   });
  // }
// }
