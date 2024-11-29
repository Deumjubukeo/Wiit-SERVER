import { PartialType } from '@nestjs/mapped-types';
import RegisterDto from '../../auth/dto/register.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class UpdateUserDto extends PartialType(RegisterDto) {
  @ApiProperty({ description: '프로필 사진', example: '프로필 사진' })
  @IsString()
  @Length(1, 100)
  imageUrl: string;
}
