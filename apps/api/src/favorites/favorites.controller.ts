import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type';

import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { FavoritesService } from './favorites.service';

@ApiTags('Favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(
    private readonly favoritesService: FavoritesService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Thêm món ăn vào danh sách yêu thích của tôi',
  })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateFavoriteDto,
  ) {
    return this.favoritesService.create(
      user.id,
      dto,
    );
  }

  @Get('me')
  @ApiOperation({
    summary: 'Lấy danh sách món yêu thích của tôi',
  })
  findMine(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.favoritesService.findMine(
      user.id,
    );
  }

  @Delete('recipe/:recipeId')
  @ApiOperation({
    summary: 'Bỏ món ăn khỏi danh sách yêu thích của tôi',
  })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('recipeId', ParseIntPipe) recipeId: number,
  ) {
    return this.favoritesService.remove(
      user.id,
      recipeId,
    );
  }
}