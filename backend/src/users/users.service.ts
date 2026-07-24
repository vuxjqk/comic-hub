import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import bcrypt from 'bcrypt';
import { Prisma } from 'generated/prisma/client';

import { deleteFile, generateFilePath, saveFile } from 'src/lib/utils';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateUserDto } from './dto/create-user.dto';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto, file: Express.Multer.File) {
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);

    let avatarPath: string | null = null;
    if (file) {
      avatarPath = generateFilePath(file, 'uploads/avatars', 'avatar');
      await saveFile(file, avatarPath);
    }

    try {
      const newUser = await this.prisma.user.create({
        data: {
          ...createUserDto,
          avatar: avatarPath,
          role: 'STAFF',
        },
      });

      return {
        success: true,
        message: 'User created successfully.',
        data: new User(newUser),
      };
    } catch (error) {
      if (avatarPath) {
        await deleteFile(avatarPath);
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException({
            errors: {
              email: ['email must be unique'],
            },
          });
        }
      }

      throw error;
    }
  }

  async findAll(query: FindAllUsersDto) {
    const skip = (query.page - 1) * query.limit;

    const where: Prisma.UserWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    where.role = 'STAFF';

    const [users, totalItems] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = totalItems > 0 ? Math.ceil(totalItems / query.limit) : 1;

    return {
      success: true,
      data: users.map((user) => new User(user)),
      meta: {
        totalItems,
        itemCount: users.length,
        itemsPerPage: query.limit,
        totalPages,
        currentPage: query.page,
      },
      filters: {
        search: query.search ?? '',
        isActive: query.isActive ?? null,
      },
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    file: Express.Multer.File,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id, role: 'STAFF' },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    let avatarPath: string | null = null;
    if (file) {
      avatarPath = generateFilePath(file, 'uploads/avatars', 'avatar');
      await saveFile(file, avatarPath);
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          ...updateUserDto,
          ...(avatarPath && { avatar: avatarPath }),
          ...(updateUserDto.email &&
            updateUserDto.email !== user.email && { emailVerifiedAt: null }),
        },
      });

      if (avatarPath && user.avatar) {
        await deleteFile(user.avatar);
      }

      return {
        success: true,
        message: 'User updated successfully.',
        data: new User(updatedUser),
      };
    } catch (error) {
      if (avatarPath) {
        await deleteFile(avatarPath);
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException({
            errors: {
              email: ['email must be unique'],
            },
          });
        }
      }

      throw error;
    }
  }

  async remove(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id, role: 'STAFF' },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    try {
      const deletedUser = await this.prisma.user.delete({
        where: { id },
      });

      if (deletedUser.avatar) {
        await deleteFile(deletedUser.avatar);
      }

      return {
        success: true,
        message: 'User deleted successfully.',
        data: new User(deletedUser),
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException('Cannot delete user in use.');
        }
      }

      throw error;
    }
  }
}
