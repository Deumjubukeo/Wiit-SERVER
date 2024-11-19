import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LostStuff } from './lostStuff.entity';
import { LostStuffService } from './lostStuff.service';
import { LostStuffController } from './lostStuff.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module'; // UsersModule 임포트 추가

@Module({
  imports: [
    TypeOrmModule.forFeature([LostStuff]),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [LostStuffController],
  providers: [LostStuffService],
  exports: [LostStuffService],
})
export class LostStuffModule {}
