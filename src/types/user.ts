export interface UserInfoResponse {
  email: string;
  name: string;
  creditScore: number;
  bank: {
    bankName: string;
    bankNumber: string;
  };
}

export interface ModifyBankRequest {
  bankId: number;
  bankNumber: string;
}
