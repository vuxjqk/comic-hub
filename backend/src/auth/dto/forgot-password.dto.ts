import { IsEmail, IsIn } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;

  @IsIn([process.env.CLIENT_URL])
  clientUrl!: string;
}
