import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { Chat } from './chat.entity';
import { Message } from './message.entity';
import { LostStuffModule } from '../lostStuff/lostStuff.module';
import { UsersModule } from '../users/users.module';
import { User } from '../users/user.entity';
import { LostStuff } from '../lostStuff/lostStuff.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, Message, User, LostStuff]),
    forwardRef(() => LostStuffModule),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
