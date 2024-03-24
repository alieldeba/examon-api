import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class CreateUserDto {
  @Length(3, 255)
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(8)
  password: string;
}
