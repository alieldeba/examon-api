import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export default class RestorePasswordDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  @Length(8)
  new_password: string;
}