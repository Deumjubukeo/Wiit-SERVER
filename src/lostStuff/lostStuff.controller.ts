import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req, Query } from "@nestjs/common";
import { LostStuffService } from './lostStuff.service';
import { CreateLostStuffDto } from './dto/createLostStuff.dto';
import { UpdateLostStuffDto } from './dto/updateLostStuff.dto';
import { AuthGuard } from '../auth/guard/auth.guard';

@Controller('lost-stuff')
export class LostStuffController {
  constructor(private readonly lostStuffService: LostStuffService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createLostStuffDto: CreateLostStuffDto, @Req() request) {
    return this.lostStuffService.create(createLostStuffDto, request.user);
  }

  @UseGuards(AuthGuard)
  @Get()
  async find(@Query('id') id?: number, @Query('keyword') keyword?: string) {
    if (id) {
      return this.lostStuffService.findOne(id);
    } else if (keyword) {
      return this.lostStuffService.findByCriteria({
        name: keyword,
        description: keyword,
      });
    }
    return this.lostStuffService.findAll();
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateLostStuffDto: UpdateLostStuffDto) {
    return this.lostStuffService.update(id, updateLostStuffDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.lostStuffService.delete(id);
  }
}
