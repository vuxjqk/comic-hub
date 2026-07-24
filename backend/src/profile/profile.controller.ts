import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { User as PrismaUser } from 'generated/prisma/client';
import { memoryStorage } from 'multer';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';

@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  findOne(@Req() req: { user: PrismaUser }) {
    return this.profileService.findOne(req.user);
  }

  @Patch()
  update(@Req() req: { user: PrismaUser }, @Body() dto: UpdateProfileDto) {
    return this.profileService.update(req.user, dto);
  }

  @Post('password')
  changePassword(
    @Req() req: { user: PrismaUser },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.profileService.changePassword(req.user, dto);
  }

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/i)) {
          return callback(
            new BadRequestException({
              errors: {
                avatar: ['avatar must be an image (jpg, jpeg, png, gif, webp)'],
              },
            }),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  uploadAvatar(
    @Req() req: { user: PrismaUser },
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.profileService.uploadAvatar(req.user, file);
  }
}
