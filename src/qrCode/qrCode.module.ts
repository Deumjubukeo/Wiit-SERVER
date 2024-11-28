import { Module } from '@nestjs/common';
import { QrCodeService } from './qrCode.service';
import { AwsModule } from '../aws/aws.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [AwsModule, UsersModule],
  providers: [QrCodeService],
  exports: [QrCodeService],
})
export class QrCodeModule {}
