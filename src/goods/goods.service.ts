import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goods } from './goods.entity';
import { CreateGoodsDto } from './dto/createGoods.dto';
import { User } from '../users/user.entity';
import * as path from 'node:path';
import { AwsService } from '../aws/aws.service';

@Injectable()
export class GoodsService {
  constructor(
    @InjectRepository(Goods)
    private goodsRepository: Repository<Goods>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly awsService: AwsService,
  ) {}

  // 상품 생성
  async createGoods(
    createGoodsDto: CreateGoodsDto,
    user: User,
    file: Express.Multer.File, // 파일 추가
  ): Promise<Goods> {
    try {
      // 관리자 권한 확인
      if (!user) {
        throw new UnauthorizedException('관리자만 상품을 생성할 수 있습니다.');
      }

      // 이미지 업로드
      const ext = path.extname(file.originalname).slice(1); // 확장자 추출
      const fileName = `${Date.now()}_${file.originalname}`; // 파일 이름 생성
      const imageUrl = await this.awsService.imageUploadToS3(
        fileName,
        file,
        ext,
      ); // S3에 이미지 업로드

      // 상품 생성
      const goods = this.goodsRepository.create({
        ...createGoodsDto,
        imageUrl, // S3에서 받은 URL 저장
      });

      return this.goodsRepository.save(goods);
    } catch (error) {
      console.log(error);
      throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  // 상품 구매
  async purchaseGoods(id: number, userId: string): Promise<Goods> {
    try {
      const goods = await this.goodsRepository.findOne({ where: { id } });
      if (!goods) {
        throw new NotFoundException('상품을 찾을 수 없습니다.');
      }
      const user = await this.userRepository.findOne({
        where: { userId: userId },
      });
      if (!user) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }
      if (user.point < goods.price) {
        throw new UnauthorizedException('포인트가 부족합니다.');
      }

      user.point -= goods.price;
      goods.purchaseCount += 1;

      await this.userRepository.save(user);
      return this.goodsRepository.save(goods);
    } catch (error) {
      console.log(error);
      throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  //인기상품
  async getPopularGoods(
    page: number,
    size: number,
  ): Promise<{ data: Goods[]; total: number; page: number; size: number }> {
    try {
      const [goods, total] = await this.goodsRepository.findAndCount({
        order: {
          purchaseCount: 'DESC',
          createdAt: 'DESC',
        },
        take: size,
        skip: (page - 1) * size,
      });

      return { data: goods, total, page, size };
    } catch (error) {
      console.log(error);
      throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
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
