import { PartialType } from '@nestjs/mapped-types';
import RegisterDto from '../../auth/dto/register.dto';

export class UpdateUserDto extends PartialType(RegisterDto) {
  point: number;
  temperature: number;
  imageUrl?: string
}
