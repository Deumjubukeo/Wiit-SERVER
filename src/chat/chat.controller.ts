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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation, ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateChattingRoomDTO } from './dto/createChattingRoom.dto';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiBearerAuth('access-token')
  @ApiBody({
    type: CreateChattingRoomDTO,
    description: '채팅방 생성을 위한 분실물 ID',
  })
  @ApiResponse({
    status: 201,
    description: '채팅방 생성 성공',
    schema: {
      example: {
        id: 1,
        isEnded: false,
        createdAt: '2024-11-19T12:41:23.056Z',
        currentUsers: ['test2', 'test1'],
        lostStuff: {
          id: 1,
          name: 'test',
          description: 'string',
          createdAt: '2024-11-19T07:43:31.951Z',
          region: 'string',
          imageUrl: 'string',
          createUser: {
            id: 1,
            userId: 'test2',
            name: '신민호',
          },
        },
        requester: {
          id: 2,
          userId: 'test1',
          name: '김의현',
        },
        writer: {
          id: 1,
          userId: 'test2',
          name: '신민호',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    schema: {
      example: {
        message: '물품을 찾을 수 없습니다.',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiResponse({
    status: 400,
    schema: {
      example: {
        message: '자신의 물품에 대한 채팅을 생성할 수 없습니다.',
        error: 'Not Found',
        statusCode: 400,
      },
    },
  })
  @UseGuards(AuthGuard)
  async createChat(@Req() request, @Body() body: CreateChattingRoomDTO) {
    const requesterId = request.user.id;
    return await this.chatService.createChat(requesterId, body.lostStuffId);
  }

  @Get('messages')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '채팅 메시지 조회',
  })
  @ApiParam({
    name: 'chatId',
    type: Number,
    description: '조회할 채팅방 ID',
    required: true,
  })
  @ApiResponse({
    schema: {
      example: {
        message: '유효하지 않은 인증 토큰입니다.',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        id: 1,
        messages: [
          {
            id: 1,
            type: 'text',
            content: '안녕?',
            isRead: true,
            createdAt: '2024-11-19T12:46:05.292Z',
            sender: {
              id: 1,
              userId: 'test2',
              name: '신민호',
              password: null,
              phoneNumber: '010-5112-1234',
              email: 'test@test',
              imageUrl: '',
              point: 0,
              temperature: 37,
              purchaseQrUrl: '',
            },
          },
        ],
      },
    },
  })
  @UseGuards(AuthGuard)
  async getChatMessages(@Query('chatId') chatId: number, @Req() request) {
    const userId = request.user.id;
    return await this.chatService.getChatMessages(chatId, userId);
  }

  @Get()
  @ApiOperation({
    summary: '유저 토큰 내에서 채팅방 목록 조회',
  })
  @ApiResponse({
    status: 200,
    description: '채팅방 조회 성공',
    schema: {
      example: [
        {
          id: 1,
          isEnded: false,
          createdAt: '2024-11-19T12:41:23.056Z',
          currentUsers: ['test2', 'test1'],
          lostStuff: {
            id: 1,
            name: 'test',
            description: 'string',
            createdAt: '2024-11-19T07:43:31.951Z',
            region: 'string',
            imageUrl: 'string',
            createUser: {
              id: 1,
              userId: 'test2',
              name: '신민호',
            },
          },
          requester: {
            id: 2,
            userId: 'test1',
            name: '김의현',
          },
          writer: {
            id: 1,
            userId: 'test2',
            name: '신민호',
          },
        },
      ],
    },
  })
  @ApiResponse({
    schema: {
      example: {
        message: '유효하지 않은 인증 토큰입니다.',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @UseGuards(AuthGuard)
  async getUserChats(@Req() request) {
    const userId = request.user.id;
    return await this.chatService.getUserChats(userId);
  }
}
