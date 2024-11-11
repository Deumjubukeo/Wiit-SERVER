import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoodsService } from './goods.service';
import { Goods } from './goods.entity';
import { GoodsController } from './goods.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Goods]), AuthModule, UsersModule],
  providers: [GoodsService],
  exports: [GoodsService],
  controllers: [GoodsController],
})
export class GoodsModule {}
