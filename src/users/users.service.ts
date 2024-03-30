import { Injectable } from '@nestjs/common';
import prisma from '../bootstrap/prisma';
import { User } from './users.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  async find(email: string): Promise<User> {
    return prisma.users.findUnique({
      where: {
        email: email,
      },
    });
  }

  async create(user: User): Promise<User> {
    const salt = await bcrypt.genSalt();

    const hashedPassword = await bcrypt.hash(user.password, salt);
    await prisma.users.create({
      data: {
        email: user.email,
        name: user.name,
        password: hashedPassword,
      },
    });
    return {
      ...user,
      password: hashedPassword,
    };
  }

  async setResetToken(email: string, token: string | null) {
    await prisma.users.update({
      where: {
        email,
      },
      data: {
        forgetPasswordToken: token,
        forgetPasswordExpireDate: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });
  }

  async restorePassword(email: string, newPassword: string) {
    const salt = await bcrypt.genSalt();

    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await prisma.users.update({
      where: {
        email,
      },
      data: {
        forgetPasswordToken: null,
        forgetPasswordExpireDate: null,
        password: hashedPassword,
      },
    });
  }
}
