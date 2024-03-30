export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  forgetPasswordToken: string;
  forgetPasswordExpireDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
