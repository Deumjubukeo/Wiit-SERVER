import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({ description: '사용자 Id' })
  userId: string;
  @ApiProperty({ description: '사용자@이메일' })
  email: string;
  @ApiProperty({ description: '사용자 이름' })
  name: string;
  @ApiProperty({ description: '비밀번호' })
  password: string;
}

export default RegisterDto;
