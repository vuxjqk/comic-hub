import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';

import { User as PrismaUser } from 'generated/prisma/client';

import { OtpDto } from 'src/common/dto/otp.dto';

import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }

  @Post('sign-up')
  signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @Post('sign-out')
  signOut(@Body() dto: RefreshTokenDto) {
    return this.authService.signOut(dto.refreshToken);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('resend-verification-otp')
  resendEmailVerificationOtp(@Req() req: { user: PrismaUser }) {
    return this.authService.issueEmailVerificationOtp(
      req.user.email,
      req.user.emailVerifiedAt,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-email')
  verifyEmail(@Req() req: { user: PrismaUser }, @Body() dto: OtpDto) {
    return this.authService.verifyEmail(req.user.email, dto.otp);
  }
}
