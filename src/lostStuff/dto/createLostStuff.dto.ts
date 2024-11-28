import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateLostStuffDto {
  @ApiProperty({ description: '분실물 제목', example: '분실물 제목' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: '분실물 설명', example: '분실물 설명' })
  @IsString()
  @Length(1, 100)
  description: string;

  @ApiProperty({ description: '습득 위치', example: '습득 위치' })
  @IsString()
  @Length(1, 100)
  region: string;

  @ApiProperty({ description: '분실물 사진', example: '분실물 사진' })
  @IsString()
  @Length(1, 100)
  imageUrl: string;
}
