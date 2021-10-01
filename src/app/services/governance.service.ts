import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Apollo, gql} from 'apollo-angular';

@Injectable({
  providedIn: 'root'
})
export class GovernanceService {

  constructor(
    private http: HttpClient,
    private apollo: Apollo,
  ) {
  }

  // Get proposals from snapshot
  getProposals(): any {
    return this.apollo.query({
      query: gql`
        query Proposals {
          proposals(first: 20, skip: 0, where: {space_in: ["bamboodefi.eth"], state: "closed"}, orderBy: "created", orderDirection: desc) {
            id
            title
            body
            choices
            start
            end
            snapshot
            state
            author
            space {
              id
              name
            }
          }
        }`,
    });
  }

  // Get all votes of a proposal
  getVotesProposal(proposalId): any {
    return this.apollo.query({
      query: gql`
      query Votes {
        votes(first: 1000, where: {proposal: "${proposalId}"}) {
          id
          voter
          created
          choice
          space {
            id
          }
        }
      }`,
    });
  }


}
