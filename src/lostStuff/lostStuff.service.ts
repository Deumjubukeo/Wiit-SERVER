import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateLostStuffDto } from './dto/updateLostStuff.dto';
import { LostStuff } from './lostStuff.entity';
import { User } from '../users/user.entity';
import { CreateLostStuffDto } from './dto/createLostStuff.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../favorite/favorite.entity';

@Injectable()
export class LostStuffService {
  constructor(
    @InjectRepository(LostStuff)
    private readonly lostStuffRepository: Repository<LostStuff>,
  ) {}

  async create(
    createLostStuffDto: CreateLostStuffDto,
    user: User,
  ): Promise<LostStuff> {
    const newLostStuff = this.lostStuffRepository.create({
      ...createLostStuffDto,
      createUser: user,
    });
    const savedStuff = await this.lostStuffRepository.save(newLostStuff);

    // 저장된 항목 다시 조회하여 favorites 길이 포함
    return await this.findOne(savedStuff.id);
  }

  async findOne(id: number): Promise<{
    favorites: Favorite[];
    createdAt: Date;
    imageUrl: string;
    name: string;
    description: string;
    createUser: {
      favorites: Favorite[];
      password: null;
      phoneNumber: string;
      imageUrl: string;
      name: string;
      temperature: number;
      id: number;
      purchaseQrUrl: string;
      userId: string;
      email: string;
      point: number;
    };
    id: number;
    region: string;
    favoritesCount: number;
  }> {
    const result = await this.lostStuffRepository
      .createQueryBuilder('lostStuff')
      .leftJoinAndSelect('lostStuff.createUser', 'user')
      .leftJoinAndSelect('lostStuff.favorites', 'favorites')
      .where('lostStuff.id = :id', { id })
      .getOne();

    if (!result) {
      throw new NotFoundException('물품을 찾을 수 없습니다.');
    }

    return {
      ...result,
      createUser: { ...result.createUser, password: null },
      favoritesCount: result.favorites ? result.favorites.length : 0,
    };
  }

  async findAll(): Promise<LostStuff[]> {
    const result = await this.lostStuffRepository
      .createQueryBuilder('lostStuff')
      .leftJoinAndSelect('lostStuff.createUser', 'user')
      .leftJoinAndSelect('lostStuff.favorites', 'favorites')
      .getMany();

    return result.map((stuff: LostStuff) => ({
      ...stuff,
      createUser: { ...stuff.createUser, password: null },
      favoritesCount: stuff.favorites ? stuff.favorites.length : 0,
    }));
  }

  async findByCriteria(criteria: { name?: string; description?: string }) {
    const query = this.lostStuffRepository
      .createQueryBuilder('lostStuff')
      .leftJoinAndSelect('lostStuff.createUser', 'user')
      .leftJoinAndSelect('lostStuff.favorites', 'favorites');

    if (criteria.name) {
      query.andWhere('lostStuff.name LIKE :name', {
        name: `%${criteria.name}%`,
      });
    }
    if (criteria.description) {
      query.andWhere('lostStuff.description LIKE :description', {
        description: `%${criteria.description}%`,
      });
    }

    const result = await query.getMany();

    return result.map((stuff: LostStuff) => ({
      ...stuff,
      createUser: { ...stuff.createUser, password: null },
      favoritesCount: stuff.favorites ? stuff.favorites.length : 0,
    }));
  }

  async update(
    id: number,
    updateLostStuffDto: UpdateLostStuffDto,
    userId: number,
  ): Promise<LostStuff> {
    const lostStuff = await this.findOne(id);

    if (lostStuff.createUser.id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to update this item',
      );
    }

    await this.lostStuffRepository.update(id, updateLostStuffDto);
    return this.findOne(id);
  }

  async delete(id: number, userId: number): Promise<void> {
    const lostStuff = await this.findOne(id);

    if (lostStuff.createUser.id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to delete this item',
      );
    }

    await this.lostStuffRepository.delete(id);
  }
}
