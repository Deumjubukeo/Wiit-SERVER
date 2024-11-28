import { ForbiddenException, HttpException, Injectable, NotFoundException } from "@nestjs/common";
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
    const [result] = await Promise.all([
      this.lostStuffRepository
        .createQueryBuilder('lostStuff')
        .leftJoinAndSelect('lostStuff.createUser', 'user'),
    ]);
    result.where('lostStuff.id = :id', { id });

    const stuff = await result.getOne();
    // const stuff = await this.lostStuffRepository.findOne({
    //   where: { id },
    //   relations: ['createUser'],
    // });
    if (!stuff) {
      throw new NotFoundException('물품을 찾을 수 없습니다.');
    }
    return { ...stuff, createUser: { ...stuff.createUser, password: null } };
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
    const query = this.lostStuffRepository.createQueryBuilder('lostStuff').leftJoinAndSelect('lostStuff.createUser', 'user');

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

  async delete(
    id: number,
    userId: number
  ): Promise<void> {
    const lostStuff = await this.findOne(id);

    if (lostStuff.createUser.id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to delete this item',
      );
    }

    await this.lostStuffRepository.delete(id);
  }
}
