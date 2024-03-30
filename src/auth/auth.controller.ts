import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { Public } from './public.decorator';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import * as crypto from 'crypto';
import UsersNotification from '../users/users.notification';
import RestorePasswordDto from './dto/restore-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private usersNotification: UsersNotification,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Public()
  @Post('/register')
  async register(@Body() user: CreateUserDto) {
    if (await this.usersService.find(user.email)) {
      return new UnauthorizedException('Email already exists.');
    }
    return this.authService.register(user);
  }

  @Public()
  @Post('/forget-password')
  async forgetPassword(@Body() user: ForgetPasswordDto) {
    const userInfo = await this.usersService.find(user.email);
    if (!userInfo) {
      return new NotFoundException('Email not found.');
    }
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 3) Send password reset code via email
    const message = `<div style="background-color: #f0f0f0; width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #cccccc; border-radius: 10px;">
    <h1 style="text-align: center; font-size: 36px;">Hi ${
      userInfo.name.split(' ')[0]
    }</h1>
    <p style="font-size: 24px; color: #000000; text-align: center;">We received a request to reset the password on your Account</p>
    <p style="color: #ff0000; font-weight: bold; text-align: center; font-size: 32px; letter-spacing: 20px;">${resetToken}</p>
    <p style="font-size: 24px; color: #000000; text-align: center;">Enter this code to complete the reset</p>
    <p style="font-size: 18px; color: #666666; text-align: center;">Thanks for helping us keep your account secure</p>
  </div>`;
    await this.usersNotification.notify(user.email, message);
    await this.usersService.setResetToken(user.email, resetToken);
    return {
      message: 'A Message containing reset link has been sent to the email',
      statusCode: 200,
    };
  }

  @Public()
  @Post('/restore-password')
  async restorePassword(@Body() validated: RestorePasswordDto) {
    const user = await this.usersService.find(validated.email);
    if (!user) {
      return new NotFoundException('Email not found.');
    }

    if (!user.forgetPasswordToken) {
      return new UnauthorizedException('Reset token is invalid or expired');
    }

    if (user.forgetPasswordExpireDate.getTime() < Date.now()) {
      return new UnauthorizedException('Reset token is invalid or expired');
    }

    if (user.forgetPasswordToken !== validated.token) {
      return new UnauthorizedException('Reset token is invalid or expired');
    }

    await this.usersService.restorePassword(user.email, validated.new_password);

    return {
      statusCode: 200,
      message: 'Password has been restored succesfully',
    };
  }
}
