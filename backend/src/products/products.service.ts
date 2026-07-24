import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from 'generated/prisma/client';

import { deleteFile, generateFilePath, saveFile } from 'src/lib/utils';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateProductDto } from './dto/create-product.dto';
import { FindAllProductsDto } from './dto/find-all-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, file: Express.Multer.File) {
    let coverImagePath: string | null = null;
    if (file) {
      coverImagePath = generateFilePath(
        file,
        'uploads/cover-images',
        'cover-image',
      );
      await saveFile(file, coverImagePath);
    }

    try {
      const newProduct = await this.prisma.product.create({
        data: {
          ...createProductDto,
          coverImage: coverImagePath,
        },
      });

      return {
        success: true,
        message: 'Product created successfully.',
        data: new Product(newProduct),
      };
    } catch (error) {
      if (coverImagePath) {
        await deleteFile(coverImagePath);
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException({
            errors: {
              slug: ['slug must be unique'],
            },
          });
        }
      }

      throw error;
    }
  }

  async findAll(query: FindAllProductsDto) {
    const skip = (query.page - 1) * query.limit;

    const where: Prisma.ProductWhereInput = {};

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.stockStatus) {
      switch (query.stockStatus) {
        case 'in_stock':
          where.stock = { gt: 10 };
          break;
        case 'low_stock':
          where.stock = { gt: 0, lte: 10 };
          break;
        case 'out_stock':
          where.stock = { lte: 0 };
          break;
      }
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const [products, totalItems] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const totalPages = totalItems > 0 ? Math.ceil(totalItems / query.limit) : 1;

    return {
      success: true,
      data: products.map((product) => new Product(product)),
      meta: {
        totalItems,
        itemCount: products.length,
        itemsPerPage: query.limit,
        totalPages,
        currentPage: query.page,
      },
      filters: {
        search: query.search ?? '',
        stockStatus: query.stockStatus ?? null,
        isActive: query.isActive ?? null,
      },
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    file: Express.Multer.File,
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    let coverImagePath: string | null = null;
    if (file) {
      coverImagePath = generateFilePath(
        file,
        'uploads/cover-images',
        'cover-image',
      );
      await saveFile(file, coverImagePath);
    }

    try {
      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data: {
          ...updateProductDto,
          ...(coverImagePath && { coverImage: coverImagePath }),
        },
      });

      if (coverImagePath && product.coverImage) {
        await deleteFile(product.coverImage);
      }

      return {
        success: true,
        message: 'Product updated successfully.',
        data: new Product(updatedProduct),
      };
    } catch (error) {
      if (coverImagePath) {
        await deleteFile(coverImagePath);
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException({
            errors: {
              slug: ['slug must be unique'],
            },
          });
        }
      }

      throw error;
    }
  }

  async remove(id: number) {
    try {
      const deletedProduct = await this.prisma.product.delete({
        where: { id },
      });

      if (deletedProduct.coverImage) {
        await deleteFile(deletedProduct.coverImage);
      }

      return {
        success: true,
        message: 'Product deleted successfully.',
        data: new Product(deletedProduct),
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Product not found.');
        }

        if (error.code === 'P2003') {
          throw new BadRequestException('Cannot delete product in use.');
        }
      }

      throw error;
    }
  }
}
