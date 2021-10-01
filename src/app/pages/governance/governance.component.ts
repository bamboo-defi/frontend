import {Component, OnInit} from '@angular/core';
import {GovernanceService} from 'src/app/services/governance.service';
import {environment} from 'src/environments/environment';

@Component({
  selector: 'app-governance',
  templateUrl: './governance.component.html',
  styleUrls: ['./governance.component.scss']
})
export class GovernanceComponent implements OnInit {

  allProposals: [{
    author?: string;
    body?: string;
    choices?: [string];
    end?: number;
    id?: string;
    snapshot?: string;
    space?: {};
    start?: number;
    state?: string;
    title?: string;
    nVotes?: number;
    result?: string;
  }] = [{}];
  proposals: Array<any>;
  today = Date.now();
  timestamp: number;
  linkProposals: string = environment.linkProposal;
  linkNewProposal: string = environment.linkNewProposal;

  constructor(
    private governanceService: GovernanceService
  ) {
  }

  ngOnInit(): void {
    this.timestamp = this.today / 1000;
    this.allProposals.pop();
    this.governanceService.getProposals().subscribe(data => {
      data.data.proposals.forEach(proposal => {
        // Remove test proposal
        if (proposal.id !== 'QmdFdT86Hc7pFcdwP32DoySUFj6bpWKr18iCZR5nPxoZPG') {
          this.allProposals.push({
            author: proposal.author,
            body: proposal.body,
            choices: proposal.choices,
            end: proposal.end,
            id: proposal.id,
            snapshot: proposal.snapshot,
            space: proposal.space,
            start: proposal.start,
            state: proposal.state,
            title: proposal.title,
            nVotes: null,
            result: null,
          });
          this.getVotesProposal(proposal);
        }
      });
      this.proposals = this.allProposals;
      console.log(this.proposals);
    });
  }

  getVotesProposal(proposal): void {
    this.governanceService.getVotesProposal(proposal.id)
      .subscribe(res => {
        const foundProposal = this.allProposals.find(element => element.id === proposal.id);
        foundProposal.nVotes = res.data.votes.length;
        console.log(proposal.id, res);
      });
  }

  selectList(type): Array<any> {
    const arrayActive = [];
    const arrayPending = [];
    const arrayClosed = [];
    this.allProposals.forEach(element => {
      if (element.end > this.timestamp && element.start > this.timestamp) {
        arrayPending.push(element);
      }
      if (element.end > this.timestamp && element.start < this.timestamp) {
        arrayActive.push(element);
      }
      if (element.end < this.timestamp) {
        arrayClosed.push(element);
      }
    });
    if (type === 'active') {
      return this.proposals = arrayActive;
    }
    if (type === 'pending') {
      return this.proposals = arrayPending;
    }
    if (type === 'closed') {
      return this.proposals = arrayClosed;
    }
    if (type === 'all') {
      return this.proposals = this.allProposals;
    }
  }

}



