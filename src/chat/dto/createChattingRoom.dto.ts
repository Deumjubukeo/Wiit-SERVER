import { ApiProperty } from '@nestjs/swagger';

export class CreateChattingRoomDTO {
  @ApiProperty()
  lostStuffId: number;
}
