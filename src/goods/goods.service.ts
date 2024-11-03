import {
  Get,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goods } from './goods.entity';
import { CreateGoodsDto } from './dto/createGoods.dto';
import { User } from '../users/user.entity';

@Injectable()
export class GoodsService {
  constructor(
    @InjectRepository(Goods)
    private goodsRepository: Repository<Goods>,
  ) {}

  // 상품 생성
  async createGoods(
    createGoodsDto: CreateGoodsDto,
    user: User,
  ): Promise<Goods> {
    try {
      //어드민인지 아닌지 확인하는 로직 아직 어드민 카테고리 없어서 임시로 !user해둠
      if (!user) {
        throw new UnauthorizedException('관리자만 상품을 생성할 수 있습니다.');
      }

      const goods = this.goodsRepository.create(createGoodsDto);
      return this.goodsRepository.save(goods);
    } catch (error) {
      console.log(error);
      throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  // 상품 구매
  async purchaseGoods(id: number): Promise<Goods> {
    const goods = await this.goodsRepository.findOne({ where: { id } });
    if (!goods) {
      throw new NotFoundException('상품을 찾을 수 없습니다.');
    }

    goods.purchaseCount += 1;
    return this.goodsRepository.save(goods);
  }
  //인기상품
  async getPopularGoods(
    page: number,
    size: number,
  ): Promise<{ data: Goods[]; total: number; page: number; size: number }> {
    const [goods, total] = await this.goodsRepository.findAndCount({
      order: {
        purchaseCount: 'DESC',
        createdAt: 'DESC',
      },
      take: size,
      skip: (page - 1) * size,
    });

    return { data: goods, total, page, size };
  }
  //상품 불러오기
  async getGoods(
    page: number,
    size: number,
  ): Promise<{ data: Goods[]; total: number; page: number; size: number }> {
    try {
      const [data, total] = await this.goodsRepository.findAndCount({
        skip: (page - 1) * size,
        take: size,
      });
      return {
        data,
        total,
        page,
        size,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  //상품삭제
  async deleteGoods(id: number, user: User) {
    try {
      //관리자인지 확인
      if (!user) {
        throw new UnauthorizedException('관리자만 상품을 삭제할 수 있습니다.');
      }
      const result = await this.goodsRepository.delete(id);
      if (!result) {
        throw new NotFoundException('없는 상품입니다');
      }
    } catch (error) {
      console.log(error);
      throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
