import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import bcrypt from 'bcrypt';
import { Prisma, User as PrismaUser } from 'generated/prisma/client';

import { deleteFile, generateFilePath, saveFile } from 'src/lib/utils';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from 'src/users/entities/user.entity';

import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  findOne(user: PrismaUser) {
    return {
      success: true,
      data: new User(user),
    };
  }

  async update(user: PrismaUser, dto: UpdateProfileDto) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          ...dto,
          ...(dto.email &&
            dto.email !== user.email && { emailVerifiedAt: null }),
        },
      });

      return {
        success: true,
        message: 'Profile updated successfully.',
        data: new User(updatedUser),
      };
    } catch (error) {
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

  async changePassword(user: PrismaUser, dto: ChangePasswordDto) {
    if (!user.password) {
      throw new NotFoundException('User not found.');
    }

    if (!(await bcrypt.compare(dto.oldPassword, user.password))) {
      throw new BadRequestException({
        errors: {
          oldPassword: ['oldPassword is incorrect'],
        },
      });
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return {
      success: true,
      message: 'Password changed successfully.',
    };
  }

  async uploadAvatar(user: PrismaUser, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({
        errors: {
          avatar: ['avatar is required'],
        },
      });
    }

    const avatarPath = generateFilePath(file, 'uploads/avatars', 'avatar');
    await saveFile(file, avatarPath);

    try {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { avatar: avatarPath },
      });

      if (user.avatar) {
        await deleteFile(user.avatar);
      }

      return {
        success: true,
        message: 'Avatar uploaded successfully.',
        data: avatarPath,
      };
    } catch (error) {
      await deleteFile(avatarPath);
      throw error;
    }
  }
}
