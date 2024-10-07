export interface SignupResponse {
  email: string;
  id: string;
  jwtToken: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginResponse {
  dailyBonus: any;
  sPointsEarnedToday: any;
  id: number;
  jwtToken: string;
  verified: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OtpRequest {
  otp: string;
}

export interface OtpResponse {
  id: number;
  jwtToken: string;
  verified: boolean;
}

export interface SaveAccountRequest {
  accountId: string;
  evmAddress: string;
}

export interface CheckReferralCodeRequest {
  referralCode: string;
}

export interface CheckReferralCodeResponse {
  message: string;
}