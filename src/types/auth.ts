export interface SignRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface SendMailRequest {
  email: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}
