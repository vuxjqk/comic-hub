import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ProfileModule } from './profile/profile.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AuthModule,
    ProfileModule,
    UsersModule,
    CategoriesModule,
    RouterModule.register([
      {
        path: 'admin',
        children: [UsersModule, CategoriesModule],
      },
    ]),
    CacheModule.register({
      isGlobal: true,
      ttl: 5 * 60 * 1000,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
