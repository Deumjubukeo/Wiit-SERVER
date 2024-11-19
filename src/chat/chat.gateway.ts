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

@WebSocketGateway({
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, Socket> = new Map();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.set(userId, client);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.delete(userId);
    }
  }

  @SubscribeMessage('join')
  async joinRoom(client: Socket, payload: { chatId: number; userId: string }) {
    try {
      const chat = await this.chatService.getChatById(payload.chatId);

      if (!chat) return;

      if (!chat.currentUsers.includes(payload.userId)) {
        chat.currentUsers.push(payload.userId);
        await this.chatService.updateChat(chat);
      }

      client.join(payload.chatId.toString());
      await this.chatService.updateMessageStatus(
        payload.chatId,
        payload.userId,
      );

      // 상대방에게 입장 알림
      const otherUserId =
        chat.writer.userId === payload.userId
          ? chat.requester.userId
          : chat.writer.userId;

      const otherUserSocket = this.connectedUsers.get(otherUserId);
      if (otherUserSocket) {
        otherUserSocket.emit('userJoined', {
          chatId: payload.chatId,
          userId: payload.userId,
        });
      }
    } catch (error) {
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
      console.log(payload);
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
        }
      });

      this.server.to(payload.chatId.toString()).emit('message', {
        ...message,
        sender: { ...message.sender, password: null },
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('quit')
  async quitRoom(client: Socket, payload: { chatId: number; userId: string }) {
    try {
      const chat = await this.chatService.getChatById(payload.chatId);

      if (!chat) return;
      if (chat.requester.userId !== payload.userId) {
        client.emit('error', {
          message: '요청자만 채팅을 종료할 수 있습니다.',
        });
        return;
      }

      chat.isEnded = true;
      chat.currentUsers = [];
      await this.chatService.updateChat(chat);

      this.server.to(payload.chatId.toString()).emit('chatEnded', {
        message: '채팅이 종료되었습니다.',
      });
      client.leave(payload.chatId.toString());
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }
}
