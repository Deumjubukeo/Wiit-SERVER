import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: '사용자 Id' })
  userId: string;
  @ApiProperty({ description: '사용자 이름' })
  name: string;
  @ApiProperty({ description: '비밀번호' })
  password: string;
  @ApiProperty({ description: '전화번호' })
  phoneNumber: string;
  @ApiProperty({ description: '프로필사진' })
  imageUrl?: string;
}

export default RegisterDto;
