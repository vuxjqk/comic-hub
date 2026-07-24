import { Length } from 'class-validator';

export class OtpDto {
  @Length(6, 6)
  otp!: string;
}
