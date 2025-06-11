export interface UserInfoResponse {
  email: string;
  name: string;
  creditScore: number;
  bank: {
    bankName: string;
    bankNumber: string;
  };
}
