import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { AwsService } from '../aws/aws.service';

@Injectable()
export class QrCodeService {
  constructor(private readonly awsService: AwsService) {}

  async generateAndUploadQrCode(userId: number): Promise<string> {
    try {
      const qrCodeContent = `USER_${userId}`;
      const qrCodeBuffer = await QRCode.toBuffer(qrCodeContent, {
        type: 'png',
        width: 300,
        errorCorrectionLevel: 'H',
      });

      const fileName = `user_qr_${userId}_${Date.now()}.png`;
      const [imageUrl] = await Promise.all([
        this.awsService.imageUploadToS3(
          fileName,
          { buffer: qrCodeBuffer } as Express.Multer.File,
          'png',
        ),
      ]);

      return imageUrl;
    } catch (error) {
      console.error('QR 코드 생성 중 오류:', error);
      throw new Error('QR 코드 생성에 실패했습니다.');
    }
  }
}
