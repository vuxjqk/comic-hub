import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendEmailVerificationOtp(to: string, otp: string) {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Email verification OTP',
        html: `
          <p>Your OTP is: <strong>${otp}</strong>. Use it to verify your email.</p>
          <p>If you did not request this, please simply ignore this email.</p>
        `,
      });
    } catch {
      throw new InternalServerErrorException(
        'We could not send your email verification OTP. Please try again later.',
      );
    }
  }

  async sendPasswordResetLink(to: string, link: string) {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Password reset link',
        html: `
          <p>Your link is: <a href="${link}">Click here</a>. Use it to reset your password.</p>
          <p>If you did not request this, please simply ignore this email.</p>
        `,
      });
    } catch {
      throw new InternalServerErrorException(
        'We could not send your password reset link. Please try again later.',
      );
    }
  }
}
