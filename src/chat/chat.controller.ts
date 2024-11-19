import {
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
  Body,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '../auth/guard/auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createChat(@Req() request, @Body() body: { lostStuffId: number }) {
    const requesterId = request.user.userId;
    return await this.chatService.createChat(requesterId, body.lostStuffId);
  }

  @Get('messages')
  @UseGuards(AuthGuard)
  async getChatMessages(@Query('chatId') chatId: number, @Req() request) {
    const userId = request.user.userId;
    return await this.chatService.getChatMessages(chatId, userId);
  }

  @Get()
  @UseGuards(AuthGuard)
  async getUserChats(@Req() request) {
    const userId = request.user.userId;
    return await this.chatService.getUserChats(userId);
  }
}
