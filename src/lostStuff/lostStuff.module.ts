import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LostStuff } from './lostStuff.entity';
import { LostStuffService } from './lostStuff.service';
import { LostStuffController } from './lostStuff.controller';
import { AuthModule } from '../auth/auth.module'; // AuthModule import

@Module({
  imports: [
    TypeOrmModule.forFeature([LostStuff]),
    AuthModule,
  ],
  controllers: [LostStuffController],
  providers: [LostStuffService],
})
export class LostStuffModule {}
