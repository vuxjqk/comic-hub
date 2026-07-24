import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

import { Match } from 'src/common/decorators/match.decorator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  token!: string;

  @MinLength(8)
  password!: string;

  @IsOptional()
  @Match('password')
  confirmPassword?: string;
}
