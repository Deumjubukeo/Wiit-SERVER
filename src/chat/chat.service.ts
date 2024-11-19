import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Chat } from './chat.entity';
import { Message, MessageType } from './message.entity';
import { LostStuffService } from '../lostStuff/lostStuff.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private readonly lostStuffService: LostStuffService,
    private readonly usersService: UsersService,
  ) {}

  async createChat(requesterId: string, lostStuffId: number) {
    const requester = await this.usersService.findOne(requesterId, true, true);
    const lostStuff = await this.lostStuffService.findOne(lostStuffId);

    console.log(requesterId);
    console.log(requester.userId);
    console.log(lostStuff.createUser.userId);

    if (lostStuff.createUser.userId == requester.userId) {
      console.log('same');
      throw new ForbiddenException('자신의 게시물에는 채팅을 할 수 없습니다.');
    }

    const existingChat = await this.chatRepository.findOne({
      where: {
        lostStuff: { id: lostStuffId },
        requester: { userId: requester.userId },
      },
    });

    if (existingChat) {
      return existingChat;
    }

    const chat = this.chatRepository.create({
      lostStuff,
      writer: lostStuff.createUser,
      requester,
      currentUsers: [lostStuff.createUser.userId, requester.userId ],
    });

    return await this.chatRepository.save(chat);
  }

  async getChatMessages(chatId: number, userId: string) {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: [
        'messages',
        'messages.sender',
        'writer',
        'requester',
        'lostStuff',
      ],
    });

    const user = await this.usersService.findOne(userId, true, true);

    if (!chat) {
      throw new NotFoundException('채팅방을 찾을 수 없습니다.');
    }

    if (chat.writer.userId !== userId && chat.requester.userId !== user.userId) {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }

    // 메시지 읽음 처리
    await this.updateMessageStatus(chatId, userId);

    return {
      id: chat.id,
      messages: chat.messages.map((msg) => ({
        ...msg,
        sender: { ...msg.sender, password: null },
      })),
      isEnded: chat.isEnded,
      lostStuff: {
        ...chat.lostStuff,
        createUser: { ...chat.lostStuff.createUser, password: null },
      },
      writer: { ...chat.writer, password: null },
      requester: { ...chat.requester, password: null },
    };
  }

  async getUserChats(userId: string) {
    const chats = await this.chatRepository.find({
      where: [
        { writer: { id: Number(userId) } },
        { requester: { id: Number(userId) } },
      ],
      relations: [
        'lostStuff',
        'lostStuff.createUser',
        'writer',
        'requester',
        'messages',
      ],
      order: {
        createdAt: 'DESC',
      },
    });

    return chats.map((chat) => ({
      ...chat,
      writer: { ...chat.writer, password: null },
      requester: { ...chat.requester, password: null },
      lostStuff: {
        ...chat.lostStuff,
        createUser: { ...chat.lostStuff.createUser, password: null },
      },
      unreadCount: chat.messages.filter(
        (msg) => !msg.isRead && msg.sender.id !== Number(userId),
      ).length,
    }));
  }

  async getChatById(chatId: number) {
    return await this.chatRepository.findOne({
      where: { id: chatId },
      relations: ['writer', 'requester', 'lostStuff', 'lostStuff.createUser'],
    });
  }

  async updateChat(chat: Chat) {
    return await this.chatRepository.save(chat);
  }

  async createMessage({
                        data,
                      }: {
    data: {
      chat: Chat;
      content: string;
      sender: { id: number } | { userId: string };  // 두 가지 형태 모두 지원
      type: MessageType;
    };
  }) {
    let senderId: string;

    // sender 객체 형태에 따라 적절히 처리
    if ('userId' in data.sender) {
      senderId = data.sender.userId;
    } else {
      senderId = data.sender.id.toString();
    }

    const sender = await this.usersService.findOne(senderId, true, false);
    if (!sender) {
      throw new NotFoundException('Sender not found');
    }

    const message = this.messageRepository.create({
      chat: data.chat,
      content: data.content,
      type: data.type,
      sender,
      isRead: false,
    });

    return await this.messageRepository.save(message);
  }

  async updateMessageStatus(chatId: number, userId: string) {
    const messages = await this.messageRepository.find({
      where: {
        chat: { id: chatId },
        isRead: false,
      },
      relations: ['sender'],
    });

    const messagesToUpdate = messages.filter(
      (message) => message.sender.userId !== userId,
    );

    if (messagesToUpdate.length > 0) {
      await this.messageRepository.update(
        messagesToUpdate.map((msg) => msg.id),
        { isRead: true },
      );
    }
  }
}
