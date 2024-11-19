import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { LostStuffModule } from './lostStuff/lostStuff.module';
import { ChatModule } from './chat/chat.module';
import { User } from './users/user.entity';
import { LostStuff } from './lostStuff/lostStuff.entity';
import { Chat } from './chat/chat.entity';
import { Message } from './chat/message.entity';
import { GoodsModule } from './goods/goods.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(3306),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      driver: require('mysql2'),
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, LostStuff, Chat, Message],
      synchronize: true,
      // logging: true,
      charset: 'utf8mb4',
      extra: {
        connectionLimit: 10,
      },
      autoLoadEntities: true,
    }),
    AuthModule,
    UsersModule,
    LostStuffModule,
    ChatModule,
    GoodsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME },
    }),
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}
