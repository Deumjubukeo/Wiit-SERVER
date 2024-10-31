import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getById(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { userId: userId },
    });
    if (user) {
      return user;
    }
    throw new HttpException(
      '사용자가 존재하지 않습니다.',
      HttpStatus.NOT_FOUND,
    );
  }

  async create(userData: RegisterDto): Promise<User> {
    const existingUserById = await this.usersRepository.findOne({
      where: { userId: userData.userId },
    });
    if (existingUserById) {
      throw new HttpException(
        '사용자 ID가 이미 존재합니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingUserByPhone = await this.usersRepository.findOne({
      where: { phoneNumber: userData.phoneNumber },
    });
    if (existingUserByPhone) {
      throw new HttpException(
        '전화번호가 이미 존재합니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newUser = this.usersRepository.create(userData);
    await this.usersRepository.save(newUser);
    return newUser;
  }
}
