import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({description: "id"})
  userId: string;
  @ApiProperty({description: "비번"})
  password: string;
}

export default LoginDto;
