import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class FindAllCategoriesDto {
  @IsOptional()
  @Transform(({ value }) => Math.max(Number(value) || 1, 1))
  page: number = 1;

  @IsOptional()
  @Transform(({ value }) => Math.max(Number(value) || 10, 1))
  limit: number = 10;

  @IsOptional()
  search?: string;
}
