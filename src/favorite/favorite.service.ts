import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';
import { LostStuff } from '../lostStuff/lostStuff.entity';
import { CreateFavoriteDto } from './dto/createFavorite.dto';
import { UsersService } from '../users/users.service';
import { LostStuffService } from '../lostStuff/lostStuff.service';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    private readonly usersService: UsersService,
    private readonly lostStuffService: LostStuffService,
  ) {}

  async addToFavorites(
    createFavoriteDto: CreateFavoriteDto,
  ): Promise<Favorite> {
    const { userId, lostStuffId } = createFavoriteDto;

    // 유저와 물품 존재 확인
    const user = await this.usersService.findOne(userId, true, true);
    const lostStuff = await this.lostStuffService.findOne(lostStuffId);

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    if (!lostStuff) {
      throw new NotFoundException('물품을 찾을 수 없습니다.');
    }

    // 중복 즐겨찾기 방지
    const existingFavorite = await this.favoriteRepository.findOne({
      where: { user: { id: Number(userId) }, lostStuff: { id: lostStuffId } },
    });

    if (existingFavorite) {
      throw new ConflictException('이미 즐겨찾기에 추가된 물품입니다.');
    }

    const favorite = this.favoriteRepository.create({
      user,
      lostStuff,
    });

    return await this.favoriteRepository.save(favorite);
  }

  async getFavoritesByUserId(userId: number): Promise<LostStuff[]> {
    const favorites = await this.favoriteRepository.find({
      where: { user: { id: userId } },
      relations: ['lostStuff', 'lostStuff.createUser'],
    });

    return favorites.map((favorite) => {
      const { lostStuff } = favorite;
      return {
        ...lostStuff,
        createUser: { ...lostStuff.createUser, password: null },
      };
    });
  }

  async removeFavorite(userId: number, lostStuffId: number): Promise<void> {
    const result = await this.favoriteRepository.delete({
      user: { id: userId },
      lostStuff: { id: lostStuffId },
    });

    if (result.affected === 0) {
      throw new NotFoundException('즐겨찾기를 찾을 수 없습니다.');
    }
  }
}
