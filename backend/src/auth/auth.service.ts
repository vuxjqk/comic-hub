import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import bcrypt from 'bcrypt';
import type { Cache } from 'cache-manager';
import { instanceToPlain } from 'class-transformer';
import { Prisma, Role } from 'generated/prisma/client';

import { generateHash, generateRandomString, getOtp } from 'src/lib/utils';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from 'src/users/entities/user.entity';

import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
    private jwt: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private generateAccessToken({
    id,
    emailVerifiedAt,
    role,
  }: {
    id: number;
    emailVerifiedAt: Date | null;
    role: Role;
  }) {
    return this.jwt.signAsync({
      sub: id,
      isEmailVerified: !!emailVerifiedAt,
      role,
      type: 'access',
    });
  }

  private async generateAndSaveRefreshToken(
    userId: number,
    rememberMe: boolean = false,
  ) {
    const refreshToken = generateRandomString();

    const days = rememberMe ? 30 : 7;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: generateHash(refreshToken),
        expiresAt,
      },
    });

    return { refreshToken, expiresAt: expiresAt.getTime() };
  }

  async signIn(dto: SignInDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException({
        errors: {
          password: ['email or password is incorrect'],
        },
      });
    }

    if (!(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException({
        errors: {
          password: ['email or password is incorrect'],
        },
      });
    }

    const accessToken = await this.generateAccessToken(user);
    const { refreshToken, expiresAt } = await this.generateAndSaveRefreshToken(
      user.id,
      dto.rememberMe,
    );

    return {
      success: true,
      message: 'Signed in successfully.',
      data: {
        accessToken,
        refreshToken,
        expiresAt,
        ...instanceToPlain(new User(user)),
      },
    };
  }

  async signUp(dto: SignUpDto) {
    dto.password = await bcrypt.hash(dto.password, 10);
    delete dto.confirmPassword;

    try {
      const newUser = await this.prisma.user.create({
        data: dto,
      });

      const accessToken = await this.generateAccessToken(newUser);
      const { refreshToken, expiresAt } =
        await this.generateAndSaveRefreshToken(newUser.id);

      await this.issueEmailVerificationOtp(newUser.email);

      return {
        success: true,
        message: 'Signed up successfully.',
        data: {
          accessToken,
          refreshToken,
          expiresAt,
          ...instanceToPlain(new User(newUser)),
        },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException({
            errors: {
              email: ['email must be unique'],
            },
          });
        }
      }

      throw error;
    }
  }

  async signOut(refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { token: generateHash(refreshToken) },
    });

    return {
      success: true,
      message: 'Signed out successfully.',
    };
  }

  async refresh(refreshToken: string) {
    const matched = await this.prisma.refreshToken.findUnique({
      where: { token: generateHash(refreshToken) },
      include: { user: true },
    });

    if (!matched) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    if (new Date() > matched.expiresAt) {
      await this.prisma.refreshToken.delete({
        where: { id: matched.id },
      });
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    const accessToken = await this.generateAccessToken(matched.user);

    return {
      success: true,
      data: {
        accessToken,
      },
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      return {
        success: true,
        message: 'If the email exists, we have sent a password reset link.',
      };
    }

    const token = generateRandomString();
    const link = `${dto.clientUrl}/reset-password?token=${token}`;

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: generateHash(token),
        expiresAt,
      },
    });

    await this.mail.sendPasswordResetLink(dto.email, link);

    return {
      success: true,
      message: 'If the email exists, we have sent a password reset link.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const matched = await this.prisma.passwordResetToken.findUnique({
      where: { token: generateHash(dto.token) },
    });

    if (!matched) {
      throw new BadRequestException('Invalid or expired token.');
    }

    if (new Date() > matched.expiresAt) {
      await this.prisma.passwordResetToken.delete({
        where: { id: matched.id },
      });
      throw new BadRequestException('Invalid or expired token.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: matched.userId },
        data: { password: hashedPassword },
      }),
      this.prisma.passwordResetToken.deleteMany({
        where: { userId: matched.userId },
      }),
      this.prisma.refreshToken.deleteMany({
        where: { userId: matched.userId },
      }),
    ]);

    return {
      success: true,
      message: 'Reset password successfully.',
    };
  }

  async issueEmailVerificationOtp(
    email: string,
    emailVerifiedAt: Date | null = null,
  ) {
    if (emailVerifiedAt) {
      throw new BadRequestException('Email has already been verified.');
    }

    const key = `otp:verify:${email}`;

    if (await this.cacheManager.get(key)) {
      throw new BadRequestException(
        'Please wait a minute before requesting a new OTP.',
      );
    }

    const otp = getOtp();

    await this.cacheManager.set(key, generateHash(otp));
    await this.mail.sendEmailVerificationOtp(email, otp);

    return {
      success: true,
      message: 'We have sent your email verification OTP.',
    };
  }

  async verifyEmail(email: string, otp: string) {
    const key = `otp:verify:${email}`;
    const attemptsKey = `otp:attempts:${email}`;
    const cachedOtp = await this.cacheManager.get(key);

    if (!cachedOtp) {
      throw new BadRequestException({
        errors: {
          otp: ['invalid or expired otp'],
        },
      });
    }

    if (generateHash(otp) !== cachedOtp) {
      const attempts = (await this.cacheManager.get<number>(attemptsKey)) || 0;

      if (attempts >= 4) {
        await Promise.all([
          this.cacheManager.del(key),
          this.cacheManager.del(attemptsKey),
        ]);
        throw new BadRequestException({
          errors: {
            otp: ['too many failed attempts, please request a new otp'],
          },
        });
      }

      await this.cacheManager.set(attemptsKey, attempts + 1);

      throw new BadRequestException({
        errors: {
          otp: ['otp is incorrect'],
        },
      });
    }

    await Promise.all([
      this.cacheManager.del(key),
      this.cacheManager.del(attemptsKey),
    ]);

    await this.prisma.user.update({
      where: { email },
      data: { emailVerifiedAt: new Date() },
    });

    return {
      success: true,
      message: 'Verified email successfully.',
    };
  }
}
