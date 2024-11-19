import { ApiProperty } from '@nestjs/swagger';

export class CreateLostStuffDto {
  @ApiProperty({ description: '' })
  name: string;
  @ApiProperty({ description: '' })
  description: string;
  @ApiProperty({ description: '' })
  region: string;
  @ApiProperty({ description: '' })
  imageUrl: string;
}
