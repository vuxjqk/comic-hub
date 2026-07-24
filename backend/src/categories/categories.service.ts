import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from 'generated/prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';

import { CreateCategoryDto } from './dto/create-category.dto';
import { FindAllCategoriesDto } from './dto/find-all-categories.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const newCategory = await this.prisma.category.create({
        data: createCategoryDto,
      });

      return {
        success: true,
        message: 'Category created successfully.',
        data: newCategory,
      };
    } catch (error) {
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

  async findAll(query: FindAllCategoriesDto) {
    const skip = (query.page - 1) * query.limit;

    const where: Prisma.CategoryWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [categories, totalItems] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.category.count({ where }),
    ]);

    const totalPages = totalItems > 0 ? Math.ceil(totalItems / query.limit) : 1;

    return {
      success: true,
      data: categories,
      meta: {
        totalItems,
        itemCount: categories.length,
        itemsPerPage: query.limit,
        totalPages,
        currentPage: query.page,
      },
      filters: {
        search: query.search ?? '',
      },
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    try {
      const updatedCategory = await this.prisma.category.update({
        where: { id },
        data: updateCategoryDto,
      });

      return {
        success: true,
        message: 'Category updated successfully.',
        data: updatedCategory,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Category not found.');
        }

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
      const deletedCategory = await this.prisma.category.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Category deleted successfully.',
        data: deletedCategory,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Category not found.');
        }

        if (error.code === 'P2003') {
          throw new BadRequestException('Cannot delete category in use.');
        }
      }

      throw error;
    }
  }
}
