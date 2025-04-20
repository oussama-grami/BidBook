import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserRatingService } from './user-rating.service';
import { CreateUserRatingDto } from './dto/create-user-rating.dto';
import { UpdateUserRatingDto } from './dto/update-user-rating.dto';

@Controller('user-rating')
export class UserRatingController {
  constructor(private readonly userRatingService: UserRatingService) {}

  @Post()
  create(@Body() createUserRatingDto: CreateUserRatingDto) {
    return this.userRatingService.create(createUserRatingDto);
  }

  @Get()
  findAll() {
    return this.userRatingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userRatingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserRatingDto: UpdateUserRatingDto) {
    return this.userRatingService.update(+id, updateUserRatingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userRatingService.remove(+id);
  }
}
