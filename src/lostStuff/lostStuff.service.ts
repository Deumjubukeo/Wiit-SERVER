import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LostStuff } from './lostStuff.entity';
import { CreateLostStuffDto } from './dto/createLostStuff.dto';
import { UpdateLostStuffDto } from './dto/updateLostStuff.dto';
import { User } from '../users/user.entity';

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
    return await this.lostStuffRepository.save(newLostStuff);
  }

  async findOne(id: number): Promise<LostStuff> {
    const stuff = await this.lostStuffRepository
      .createQueryBuilder('lostStuff')
      .leftJoinAndSelect('lostStuff.createUser', 'user')
      .where('lostStuff.id = :id', { id })
      .getOne();

    if (!stuff) {
      throw new NotFoundException('물품을 찾을 수 없습니다.');
    }

    return {
      ...stuff,
      createUser: { ...stuff.createUser, password: null },
    };
  }

  async findAll(): Promise<LostStuff[]> {
    const result = await this.lostStuffRepository
      .createQueryBuilder('lostStuff')
      .leftJoinAndSelect('lostStuff.createUser', 'user')
      .getMany();
    return result.map((stuff: LostStuff) => {
      return { ...stuff, createUser: { ...stuff.createUser, password: null } };
    });
  }

  async findByCriteria(criteria: { name?: string; description?: string }) {
    const query = this.lostStuffRepository
      .createQueryBuilder('lostStuff')
      .leftJoinAndSelect('lostStuff.createUser', 'user');

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

    return result.map((stuff: LostStuff) => {
      return { ...stuff, createUser: { ...stuff.createUser, password: null } };
    });
  }

  async update(
    id: number,
    updateLostStuffDto: UpdateLostStuffDto,
  ): Promise<LostStuff> {
    await this.lostStuffRepository.update(id, updateLostStuffDto);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.lostStuffRepository.delete(id);
  }

  async findUserCreatedStuff(userId: number): Promise<LostStuff[]> {
    const result = await this.lostStuffRepository
      .createQueryBuilder('lostStuff')
      .leftJoinAndSelect('lostStuff.createUser', 'user')
      .where('user.id = :userId', { userId })
      .getMany();

    return result.map((stuff: LostStuff) => ({
      ...stuff,
      createUser: { ...stuff.createUser, password: null },
    }));
  }
}
