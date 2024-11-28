import { forwardRef, Module } from '@nestjs/common';
import { AwsService } from './aws.service';
import { ConfigModule } from '@nestjs/config';
import { AwsGuard } from './aws.guard';
import { AwsController } from './aws.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ConfigModule, forwardRef(() => AuthModule)],
  providers: [AwsService, AwsGuard],
  exports: [AwsService, AwsGuard],
  controllers: [AwsController],
})
export class AwsModule {}
