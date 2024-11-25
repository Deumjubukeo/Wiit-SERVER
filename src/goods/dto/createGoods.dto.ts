// @ts-ignore
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateGoodsDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsNumber()
  price: number;

  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  purchaseCount: number;
}
