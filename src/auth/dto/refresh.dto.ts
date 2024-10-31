import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @ApiProperty({ description: 'Refresh token' })
  refreshToken: string;
}

export default RefreshDto;
