import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AwsService } from './aws.service';
import * as path from 'node:path';

@Injectable()
export class AwsGuard {
  constructor(private readonly awsService: AwsService) {}

  async uploadImage(file: Express.Multer.File): Promise<string> {
    try {
      if (!file) {
        throw new UnauthorizedException('파일이 없습니다.');
      }

      const ext = path.extname(file.originalname).slice(1);
      const fileName = `${Date.now()}_${file.originalname}`;
      const imageUrl = await this.awsService.imageUploadToS3(
        fileName,
        file,
        ext,
      );

      return imageUrl;
    } catch (error) {
      console.log(error);
      throw new Error('이미지 업로드 중 오류가 발생했습니다.');
    }
  }
}
