import { IsString, IsNumber, IsOptional, Length, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGoodsDto {
  @ApiProperty({ description: '상품 제목', example: '상품 제목' })
  @IsString()
  @Length(1, 100)
  title: string;

  @ApiProperty({ description: '상품 상세 설명', example: '상품 상세 설명' })
  @IsString()
  @Length(1, 500)
  content: string;

  @ApiProperty({ description: '상품 가격', example: 1000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: '상품 이미지' })
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  purchaseCount: number;
}
