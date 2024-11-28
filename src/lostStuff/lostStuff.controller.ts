import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { LostStuffService } from './lostStuff.service';
import { CreateLostStuffDto } from './dto/createLostStuff.dto';
import { UpdateLostStuffDto } from './dto/updateLostStuff.dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Lost Stuff')
@Controller('lost-stuff')
export class LostStuffController {
  constructor(private readonly lostStuffService: LostStuffService) {}

  @Post()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '분실물 등록' })
  @ApiBody({ type: CreateLostStuffDto })
  @ApiResponse({
    status: 201,
    description: '분실물 등록 성공',
    schema: {
      example: {
        id: 1,
        name: '지갑',
        description: '가죽 지갑',
        region: '서울',
        imageUrl: 'path/to/image.jpg',
      },
    },
  })
  @UseGuards(AuthGuard)
  async create(@Body() createLostStuffDto: CreateLostStuffDto, @Req() request) {
    return this.lostStuffService.create(createLostStuffDto, request.user);
  }

  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '분실물 조회' })
  @ApiQuery({
    name: 'id',
    type: Number,
    required: false,
    description: '특정 분실물 ID',
  })
  @ApiQuery({
    name: 'keyword',
    type: String,
    required: false,
    description: '검색 키워드',
  })
  @ApiResponse({
    status: 200,
    description:
      '검색 키워드로 검색 시 분실물 목록, 특정 분실물 ID 검색 시 상세 정보 반환',
    schema: {
      example: [
        {
          id: 1,
          name: '지갑',
          description: '가죽 지갑',
          region: '서울',
          imageUrl: 'path/to/image.jpg',
        },
      ],
    },
  })
  @UseGuards(AuthGuard)
  async find(@Query('id') id?: number, @Query('keyword') keyword?: string) {
    if (id) {
      return this.lostStuffService.findOne(id);
    } else if (keyword) {
      return this.lostStuffService.findByCriteria({
        name: keyword,
        description: keyword,
      });
    }
    return this.lostStuffService.findAll();
  }

  @Patch()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '분실물 정보 수정' })
  @ApiParam({ name: 'id', type: Number, description: '수정할 분실물 ID' })
  @ApiBody({ type: UpdateLostStuffDto })
  @ApiResponse({
    status: 200,
    description: '분실물 정보 수정 성공',
    schema: {
      example: {
        id: 1,
        name: '수정된 지갑',
        description: '수정된 가죽 지갑',
      },
    },
  })
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: number,
    @Body() updateLostStuffDto: UpdateLostStuffDto,
    @Req() request,
  ) {
    return this.lostStuffService.update(
      id,
      updateLostStuffDto,
      request.user.id,
    );
  }

  @Delete()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '분실물 삭제' })
  @ApiParam({ name: 'id', type: Number, description: '삭제할 분실물 ID' })
  @ApiResponse({
    status: 200,
    description: '분실물 삭제 성공',
    schema: {
      example: {
        message: '분실물이 성공적으로 삭제되었습니다.',
      },
    },
  })
  @UseGuards(AuthGuard)
  async delete(@Param('id') id: number, @Req() request) {
    return this.lostStuffService.delete(id, request.user.id);
  }
}
