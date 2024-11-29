import { PartialType } from '@nestjs/mapped-types';
import RegisterDto from '../../auth/dto/register.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class UpdateUserDto extends PartialType(RegisterDto) {
  @ApiProperty({ description: '보유 포인트', example: '보유 포인트(필수 아님)' })
  @IsString()
  @Length(1, 100)
  point?: number;
  @ApiProperty({ description: '유저 온도', example: '유저 온도 (필수 아님)' })
  @IsString()
  @Length(1, 100)
  temperature?: number;
  @ApiProperty({ description: '프로필 사진', example: '프로필 사진' })
  @IsString()
  @Length(1, 100)
  imageUrl?: string;
}
