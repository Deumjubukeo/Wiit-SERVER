import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Res,
  Get,
  Query,
  ParseIntPipe,
  Delete,
  Param,
} from '@nestjs/common';
import { GoodsService } from './goods.service';
import { CreateGoodsDto } from './dto/createGoods.dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Goods } from './goods.entity';

@ApiTags('Goods')
@Controller('goods')
export class GoodsController {
  constructor(private readonly goodsService: GoodsService) {}

  @Post('create')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '상품등록' })
  @ApiResponse({ status: 201, description: '상품 등록 성공' })
  async createGoods(
    @Body() createGoodsDto: CreateGoodsDto,
    @Req() request,
    @Res() response: Response,
  ) {
    const newGoods = await this.goodsService.createGoods(
      createGoodsDto,
      request.user,
    );
    return response.status(201).json(newGoods);
  }
  //상품구매
  @Post(':id/purchase')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '상품 구매' })
  @ApiResponse({ status: 200, description: '상품 구매 성공', type: Goods })
  async purchaseGoods(@Param('id', ParseIntPipe) id: number): Promise<Goods> {
    return this.goodsService.purchaseGoods(id);
  }
  //인기 상품 불러오기
  @Get('popular')
  @ApiOperation({ summary: '인기 상품 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '인기 상품 목록',
    schema: {
      example: {
        data: [
          {
            id: 1,
            title: '상품',
            content: '상세 설명',
            price: 100,
            purchaseCount: 10,
            createdAt: '2024-10-31T03:15:43.000Z',
          },
        ],
        total: 50,
        page: 1,
        size: 10,
      },
    },
  })
  //상품 불러오기
  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '상품 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '상품 목록',
    schema: {
      example: {
        data: [
          {
            id: 1,
            title: '제목',
            content: '상세설명',
            price: 1000,
            createdAt: '2024-10-31T03:15:43.000Z',
          },
        ],
      },
    },
  })
  async getGoods(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('size', ParseIntPipe) size: number = 10,
  ): Promise<{ data: Goods[]; total: number; page: number; size: number }> {
    return this.goodsService.getGoods(page, size);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '상품 삭제' })
  @ApiResponse({ status: 200, description: '상품 삭제 성공' })
  @ApiResponse({ status: 401, description: '관리자 권한이 필요합니다.' })
  async deleteGoods(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ): Promise<void> {
    const user = req.user;

    return this.goodsService.deleteGoods(id, user);
  }
}
