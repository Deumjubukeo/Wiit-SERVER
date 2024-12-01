import { Controller, Post, Delete, Get, Param, Body, UseGuards, Req, Query } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { CreateFavoriteDto } from './dto/createFavorite.dto';
import { User } from '../users/user.entity';
import { AuthGuard } from '../auth/guard/auth.guard';

@Controller('favorites')
@UseGuards(AuthGuard)
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post()
  async addToFavorites(
    @Body() createFavoriteDto: CreateFavoriteDto,
    @Req() request,
  ) {
    createFavoriteDto.userId = request.user.id;
    return this.favoriteService.addToFavorites(createFavoriteDto);
  }

  @Get()
  async getFavorites(@Req() requset) {
    return this.favoriteService.getFavoritesByUserId(requset.user.id);
  }

  @Delete()
  async removeFavorite(
    @Query('lostStuffId') lostStuffId: number,
    @Req() request,
  ) {
    return this.favoriteService.removeFavorite(request.user.id, lostStuffId);
  }
}
