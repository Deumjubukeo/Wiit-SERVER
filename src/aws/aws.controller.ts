import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Req,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AwsService } from './aws.service';
import { AuthGuard } from '../auth/guard/auth.guard';

@ApiTags('AWS')
@Controller('aws')
export class AwsController {
  constructor(private readonly awsService: AwsService) {}

  @Post('upload')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '파일 업로드' })
  @ApiResponse({ status: 201, description: '파일 업로드 성공' })
  async uploadFile(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
    @Req() request,
    @Res() response: Response,
  ) {
    if (!file) {
      return response.status(400).json({
        message: '파일을 업로드해주세요.',
        error: 'Bad Request',
      });
    }

    const fileName = `${Date.now()}-${file.originalname}`;

    const ext = file.originalname.split('.').pop().toLowerCase();
    console.log(ext);
    try {
      const uploadedFileUrl = await this.awsService.imageUploadToS3(
        fileName,
        file,
        ext,
      );

      return response.status(201).json({
        message: '파일 업로드 성공',
        url: uploadedFileUrl,
        fileName: fileName,
      });
    } catch (error) {
      return response.status(500).json({
        message: '파일 업로드 중 오류가 발생했습니다.',
        error: error.message,
      });
    }
  }
}
