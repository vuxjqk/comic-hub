import { Decimal } from '@prisma/client/runtime/client';
import { Expose } from 'class-transformer';
import { Product as PrismaProduct } from 'generated/prisma/client';

export class Product implements PrismaProduct {
  id!: number;
  title!: string;
  slug!: string;
  price!: Decimal;
  salePrice!: Decimal | null;
  stock!: number;
  description!: string | null;
  coverImage!: string | null;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<Product>) {
    Object.assign(this, partial);
  }

  @Expose()
  get finalPrice() {
    return this.salePrice ?? this.price;
  }
}
