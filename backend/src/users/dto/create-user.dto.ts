import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @MinLength(8)
  password!: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : String(value)))
  phone?: string | null;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : String(value)))
  address?: string | null;
}
