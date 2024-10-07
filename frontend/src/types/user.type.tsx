export interface UserLink {
  id?: number;
  name: string;
  url: string;
}

export interface UserProfileType {
  isOwner(arg0: string, isOwner: any): unknown;
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  bio: string;
  username: string;
  accountId: string;
  links: UserLink[];
  bgImgUrl: string;
  profileImgUrl: string;
  createdAt: Date;
  evmAddress: string; 
  referralCode?: string;
  usedReferralCode?: string;
  total_spoint?: number;
  register_spoint?: number;
  achievement_spoint?: number;
  inviteCode_spoint?: number;
  block_number: any;
  block_hash: string;
  signature: string;
  message_hash: string;
}

export interface UserProfileResponse {
  userProfile: UserProfileType;
}

export interface UserProfileResponse extends UserProfileType { }

export interface UserAccountIdResponse {
  accountId: string;
}

export interface SaveUserProfileRequest {
  firstName: string;
  lastName: string;
  username: string;
  bio: string;
  links: UserLink[];
}

export interface ChangeUserPasswordRequest {
  oldPassword: string;
  newPassword: string;
}
// blockchain.type.ts
export interface UpdateUserReferralCountRequest {
  usedReferralCode: string;
}

export interface UpdateUserReferralCountResponse {
  message(arg0: string, message: any): unknown;
  // Define the expected response structure here, if any
}

// In auth.type.ts or another relevant file
export interface UserByReferralCodeResponse {
  status: number;
  message: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  referralCode: string;
  usedReferralCode: string;
  referralCount: number;
  total_spoint: number;
}

export interface UserByReferralCodeRequest {
  referralCode: string;
}

export interface UpdateBlockInfoRequest {
  blockHash: string;
  blockNumber: string;
  messageHash: string;
}

export interface UpdateBlockInfoResponse {
  message: string;
}

export interface CheckSignatureRequest {
  blockNumber: string;
}

export interface CheckSignatureResponse {
  [x: string]: any;
  found: boolean;
}
export interface SaveAccountRequest {
  accountId: string;
  evmAddress: string;
}
