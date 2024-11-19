import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import CreateUserDto from './dto/createUser.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getById(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { userId: userId },
    });
    if (!user) {
      throw new HttpException(
        '사용자가 존재하지 않습니다.',
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  async create(userData: CreateUserDto) {
    const newUser = this.usersRepository.create({
      userId: userData.userId,
      name: userData.name,
      password: userData.password,
      phoneNumber: userData.phoneNumber,
    });
    return await this.usersRepository.save(newUser);
  }
}
