import {
  Body,
  Controller,
  Get,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/guard/auth.guard';
import { UpdateUserDto } from './dto/updateUser.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LostStuffService } from '../lostStuff/lostStuff.service';

@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly lostStuffService: LostStuffService,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  @ApiOperation({ summary: '사용자 검색' })
  @ApiResponse({
    status: 200,
    description: '사용자 정보 반환',
    schema: {
      example: {
        id: 1,
        name: '김망고',
        email: 'mango@Philippines.com',
      },
    },
  })
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
  @ApiResponse({
    status: 200,
    description: '사용자 프로필 편집 성공',
    schema: {
      example: {
        id: 1,
        name: '김망고',
        email: 'mango@Philippines.com',
        phoneNumber: '010-1234-5678',
        point: 120,
        temperature: 37.5,
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 인증 정보' })
  async patch(@Req() request, @Body() updateLostStuffDto: UpdateUserDto) {
    return this.usersService.update(request.user.id, updateLostStuffDto);
  }

  @UseGuards(AuthGuard)
  @Get('/profile')
  @ApiOperation({ summary: '사용자 프로필 불러오기' })
  @ApiResponse({
    status: 200,
    description: '사용자 프로필 불러오기 성공',
    schema: {
      example: {
        user: {
          id: 1,
          name: '김망고',
          email: 'mango@Philippines.com',
          point: 100,
          temperature: 36.5,
        },
        mylostStuff: [
          {
            id: 1,
            title: '지갑',
            description: '가죽 지갑',
            createdAt: '2024-11-22T12:00:00Z',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 400, description: '유저가 존재하지 않습니다' })
  async getProfile(@Req() request) {
    const user = await this.usersService.findOne(request.user.id, false, true);
    const lostStuff = await this.lostStuffService.findByCriteria({
      name: '',
      description: '',
    });
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        point: user.point,
        temperature: user.temperature,
      },
      mylostStuff: lostStuff.filter((item) => item.createUser.id === user.id),
    };
  }
}
