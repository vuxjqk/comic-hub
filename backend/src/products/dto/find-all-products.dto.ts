import { Transform } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

export class FindAllProductsDto {
  @IsOptional()
  @Transform(({ value }) => Math.max(Number(value) || 1, 1))
  page: number = 1;

  @IsOptional()
  @Transform(({ value }) => Math.max(Number(value) || 10, 1))
  limit: number = 10;

  @IsOptional()
  search?: string;

  @IsOptional()
  @IsIn(['in_stock', 'low_stock', 'out_stock'])
  stockStatus?: 'in_stock' | 'low_stock' | 'out_stock';

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  isActive?: boolean;
}
