import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

import { Match } from 'src/common/decorators/match.decorator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  oldPassword!: string;

  @MinLength(8)
  newPassword!: string;

  @IsOptional()
  @Match('newPassword')
  confirmPassword?: string;
}
