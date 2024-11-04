import { Body, Controller, Get, Patch, Query, Req, UseGuards } from "@nestjs/common";
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/guard/auth.guard';
import { UpdateUserDto } from "./dto/updateUser.dto";
import { ApiOperation, ApiProperty, ApiResponse } from "@nestjs/swagger";

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get()
  @ApiOperation({ summary: '사용자 검색' })
  @ApiResponse({ status: 400, description: '유저가 존재하지 않습니다' })
  async find(@Req() request, @Query('id') id?: string) {
    if (id) {
      return this.usersService.findOne(id, true);
    }

    return this.usersService.findOne(request.user.userId, true);
  }

  @UseGuards(AuthGuard)
  @Patch()
  @ApiOperation({ summary: '사용자 프로필 편집' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 400, description: '잘못된 인증 정보' })
  async patch(@Req() request, @Body() updateLostStuffDto: UpdateUserDto) {
    return this.usersService.update(request.user.id, updateLostStuffDto);
  }
}
