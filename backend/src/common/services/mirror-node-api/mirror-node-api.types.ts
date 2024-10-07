export type MirrorApiNftTransfer = {
  is_approval: boolean;
  receiver_account_id: string;
  sender_account_id: string;
  serial_number: number;
  token_id: string;
}

export type MirrorApiTransfer = {
  account: string;
  amount: number;
  is_approval: boolean;
}

export type MirrorApiTransaction = {
  bytes?: string;
  charged_tx_fee: number;
  consensus_timestamp: string;
  entity_id?: any;
  max_fee: string;
  memo_base64: string;
  name: string;
  nft_transfers: any[];
  node: string;
  nonce: number;
  parent_consensus_timestamp?: any;
  result: string;
  scheduled: false;
  staking_reward_transfers?: any[];
  token_transfers: [];
  transaction_hash: string;
  transaction_id: string;
  transfers: MirrorApiTransfer[];
  valid_duration_seconds: string;
  valid_start_timestamp: string;
}

export type MirrorApiTransactions = {
  transactions: MirrorApiTransaction[];
  links: {
    next: string;
  }
}

export type MirrorApiAccountNft = {
  account_id: string;
  created_timestamp: string;
  delegating_spender?: any;
  deleted: boolean;
  metadata: string;
  modified_timestamp: string;
  serial_number: number;
  spender: string;
  token_id: string;
}

export type MirrorApiAccountNfts = {
  nfts: MirrorApiAccountNft[];
  links: {
    next: string;
  }
}

export type MirrorApiAccountToken = {
  automatic_association: boolean,
  balance: number,
  created_timestamp: string,
  freeze_status: string,
  kyc_status: string,
  token_id: string;
}

export type MirrorApiAccountTokens = {
  tokens: MirrorApiAccountToken[];
  links: {
    next: string;
  }
}