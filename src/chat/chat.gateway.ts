import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { MessageType } from './message.entity';
import { UsersService } from '../users/users.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatService: ChatService,
    private readonly usersService: UsersService,
  ) {}

  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, Socket> = new Map();

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
    console.log('Query params:', client.handshake.query);

    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.set(userId, client);
      console.log('Connected users:', this.connectedUsers.keys());
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.delete(userId);
      console.log('Remaining users:', this.connectedUsers.keys());
    }
  }

  @SubscribeMessage('join')
  async joinRoom(client: Socket, payload: { chatId: number; userId: string }) {
    console.log('Join event received:', payload);
    try {
      const chat = await this.chatService.getChatById(payload.chatId);
      console.log('Found chat:', chat?.id);

      if (!chat) {
        console.log('Chat not found');
        return;
      }

      if (!chat.currentUsers.includes(payload.userId)) {
        console.log('Adding user to currentUsers');
        chat.currentUsers.push(payload.userId);
        await this.chatService.updateChat(chat);
      }

      client.join(payload.chatId.toString());
      console.log('Client joined room:', payload.chatId);

      await this.chatService.updateMessageStatus(
        payload.chatId,
        payload.userId,
      );

      // 상대방에게 입장 알림
      const otherUserId =
        chat.writer.userId === payload.userId
          ? chat.requester.userId
          : chat.writer.userId;
      console.log('Notifying other user:', otherUserId);

      const otherUserSocket = this.connectedUsers.get(otherUserId);
      if (otherUserSocket) {
        otherUserSocket.emit('userJoined', {
          chatId: payload.chatId,
          userId: payload.userId,
        });
        console.log('Notification sent to other user');
      }

      // 클라이언트에게 성공 응답
      client.emit('joinSuccess', {
        chatId: payload.chatId,
        userId: payload.userId,
      });
    } catch (error) {
      console.error('Error in joinRoom:', error);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('message')
  async handleMessage(
    client: Socket,
    payload: {
      chatId: number;
      senderId: string;
      content: string;
      type: MessageType;
    },
  ) {
    try {
      console.log('Message payload:', payload);
      const chat = await this.chatService.getChatById(payload.chatId);

      if (!chat || chat.isEnded) {
        client.emit('error', { message: '종료된 채팅방입니다.' });
        return;
      }

      const message = await this.chatService.createMessage({
        data: {
          chat,
          sender: { userId: payload.senderId },
          content: payload.content,
          type: payload.type,
        },
      });

      console.log('Created message:', message);

      this.server.to(payload.chatId.toString()).emit('message', {
        ...message,
        sender: { ...message.sender, password: null },
      });
    } catch (error) {
      console.error('Error in handleMessage:', error);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('quit')
  async quitRoom(
    client: Socket,
    payload: {
      chatId: number;
      userId: string;
      point: number;
    },
  ) {
    try {
      const chat = await this.chatService.getChatById(payload.chatId);

      if (!chat) return;
      if (chat.requester.userId !== payload.userId) {
        client.emit('error', {
          message: '요청자만 채팅을 종료할 수 있습니다.',
        });
        return;
      }

      const pointMap = {
        1: 50,
        2: 100,
        3: 150,
        4: 200,
      };

      const pointToAdd = pointMap[payload.point];

      if (pointToAdd === undefined) {
        client.emit('error', {
          message: '유효하지 않은 포인트 값입니다.',
        });
        return;
      }

      if (chat.writer) {
        await this.usersService.updatePoint(
          chat.writer.id.toString(),
          pointToAdd,
        );
      }

      chat.isEnded = true;
      chat.currentUsers = [];
      await this.chatService.updateChat(chat);

      this.server.to(payload.chatId.toString()).emit('chatEnded', {
        message: '채팅이 종료되었습니다.',
        pointAdded: pointToAdd, // Optionally send point info to clients
      });

      client.leave(payload.chatId.toString());
    } catch (error) {
      console.error('Error in quitRoom:', error);
      client.emit('error', { message: error.message });
    }
  }
}
