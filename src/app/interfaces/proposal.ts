export interface Proposal {
  proposition: string;
  isValidate: boolean;
  isRejected: boolean;
  propositionWallet: string;
  propositionVote: boolean;
  voteTotal: number;
  voteOk: number;
  voteNo: number;
  isVoted: boolean;
  isApproved: boolean;
}
