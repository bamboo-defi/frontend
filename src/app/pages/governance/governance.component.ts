import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Proposal} from 'src/app/interfaces/proposal';

@Component({
  selector: 'app-governance',
  templateUrl: './governance.component.html',
  styleUrls: ['./governance.component.scss']
})
export class GovernanceComponent implements OnInit {

  propositions: Proposal[] = [{
    proposition: 'This is an example',
    isValidate: true,
    isRejected: false,
    propositionWallet: '0fx00000000001',
    propositionVote: true,
    voteTotal: 5000,
    voteOk: 4000,
    voteNo: 1000,
    isVoted: false,
    isApproved: false
  },
    {
      proposition: 'This is an example 2',
      isValidate: true,
      isRejected: false,
      propositionWallet: '0fx00000000002',
      propositionVote: true,
      voteTotal: 8000,
      voteOk: 2000,
      voteNo: 6000,
      isVoted: false,
      isApproved: false
    },
    {
      proposition: 'This is an example',
      isValidate: false,
      isRejected: false,
      propositionWallet: '0fx00000000001',
      propositionVote: null,
      voteTotal: null,
      voteOk: null,
      voteNo: null,
      isVoted: false,
      isApproved: false
    },
    {
      proposition: 'This is an example',
      isValidate: false,
      isRejected: true,
      propositionWallet: '0fx00000000001',
      propositionVote: null,
      voteTotal: null,
      voteOk: null,
      voteNo: null,
      isVoted: false,
      isApproved: false
    },
    {
      proposition: 'This is an example',
      isValidate: true,
      isRejected: false,
      propositionWallet: '0fx00000000001',
      propositionVote: true,
      voteTotal: 5000,
      voteOk: 3500,
      voteNo: 1500,
      isVoted: true,
      isApproved: true
    }];

  step: number;

  constructor(
    public dialog: MatDialog,
  ) {
  }

  ngOnInit(): void {

  }

  /**
   * Open dialog to create a proposal
   */
  createProposal(): void {
    const dialogRef = this.dialog.open(SetProposition, {
      width: '450px',
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  /**
   * Open dialog to approve proposal
   */
  approve(): void {
    const dialogRef = this.dialog.open(ApproveProposition, {
      width: '450px',
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  /**
   * Open dialog to deny proposition
   */
  deny(): void {
    const dialogRef = this.dialog.open(DenyProposition, {
      width: '450px',
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

}

@Component({
  selector: 'app-set-proposition',
  templateUrl: './set-proposition.html',
  styleUrls: ['./set-proposition.scss']
})

// tslint:disable-next-line:component-class-suffix
export class SetProposition implements OnInit {

  ngOnInit(): void {

  }
}


@Component({
  selector: 'app-approve-proposition',
  templateUrl: './approve-proposition.html',
  styleUrls: ['./approve-proposition.scss']
})

// tslint:disable-next-line:component-class-suffix
export class ApproveProposition implements OnInit {

  ngOnInit(): void {

  }
}

@Component({
  selector: 'app-deny-proposition',
  templateUrl: './deny-proposition.html',
  styleUrls: ['./deny-proposition.scss']
})

// tslint:disable-next-line:component-class-suffix
export class DenyProposition implements OnInit {

  ngOnInit(): void {

  }
}



