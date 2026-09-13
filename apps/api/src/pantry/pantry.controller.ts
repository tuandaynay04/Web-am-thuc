import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
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

import { CreatePantryItemDto } from './dto/create-pantry-item.dto';
import { UpdatePantryItemDto } from './dto/update-pantry-item.dto';
import { PantryService } from './pantry.service';

@ApiTags('Pantry')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pantry')
export class PantryController {
  constructor(
    private readonly pantryService: PantryService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Thêm nguyên liệu vào bếp của tôi',
  })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePantryItemDto,
  ) {
    return this.pantryService.create(
      user.id,
      dto,
    );
  }

  @Get('me')
  @ApiOperation({
    summary: 'Lấy nguyên liệu trong bếp của tôi',
  })
  findMine(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.pantryService.findMine(
      user.id,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết nguyên liệu trong bếp của tôi',
  })
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.pantryService.findOne(
      user.id,
      id,
    );
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật nguyên liệu trong bếp của tôi',
  })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePantryItemDto,
  ) {
    return this.pantryService.update(
      user.id,
      id,
      dto,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa nguyên liệu khỏi bếp của tôi',
  })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.pantryService.remove(
      user.id,
      id,
    );
  }
}
