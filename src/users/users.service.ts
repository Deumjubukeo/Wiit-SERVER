import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterDto } from '../auth/dto/register.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(
    userId: string,
    isNeedDelPassword: boolean = false,
    isIdx: boolean = false,
  ): Promise<User | any> {
    const user = await this.usersRepository.findOne({
      where: isIdx ? { id: Number(userId) } : { userId: userId },
    });
    if (user) {
      if (isNeedDelPassword) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return result;
      }

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
  //이미지만 수정
  async updateProfileImage(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User | string> {
    const user = await this.findOne(id, false, true);

    if (!user) {
      throw new HttpException(
        '해당 유저가 존재하지 않습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 이미지 URL만 업데이트
    if (updateUserDto.imageUrl) {
      user.imageUrl = updateUserDto.imageUrl;
    }

    await this.usersRepository.update(id, { imageUrl: updateUserDto.imageUrl });

    return this.findOne(id); // 업데이트된 유저 정보를 반환
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User | string> {
    const User = await this.findOne(id, false, true);

    const hashedPassword = await bcrypt.hash(updateUserDto.password, 5);

    if (!User) {
      throw new HttpException(
        '해당 유저가 존재하지 않습니다. 탱탱',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (User.id === id) {
      try {
        await this.usersRepository.update(id, {
          ...updateUserDto,
          password: hashedPassword,
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        throw new HttpException(
          '전화번호 또는 아이디가 이미 존재합니다. 탱탱',
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      throw new HttpException(
        '해당 유저를 편집할 권한이 없습니다. 탱탱',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.findOne(updateUserDto.userId);
  }
}
