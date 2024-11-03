import { ApiProperty } from '@nestjs/swagger';

export class CreateGoodsDto {
  @ApiProperty({ description: '제목' })
  title: string;

  @ApiProperty({ description: '내용' })
  content: string;

  @ApiProperty({ description: '가격' })
  pize: number;

  @ApiProperty({ description: '이미지' })
  imageUrl: string;
}
