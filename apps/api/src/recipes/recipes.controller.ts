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

import { Role } from '../../generated/prisma/enums';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipesService } from './recipes.service';

@ApiTags('Recipes')
@Controller('recipes')
export class RecipesController {
  constructor(
    private readonly recipesService: RecipesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Tạo món ăn và công thức',
  })
  create(
    @Body() dto: CreateRecipeDto,
  ) {
    return this.recipesService.create(dto);
  }

    @Get()
  @ApiOperation({
    summary: 'Lấy danh sách món ăn',
  })
  findAll() {
    return this.recipesService.findAll();
  }

  // ADMIN: lấy tất cả món kể cả DRAFT và ARCHIVED
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'ADMIN lấy toàn bộ món ăn',
  })
  findAllForAdmin() {
    return this.recipesService.findAllForAdmin();
  }


  @Get('recommendations/by-pantry/:userId')
  @ApiOperation({
    summary: 'Gợi ý món ăn dựa trên nguyên liệu trong bếp',
  })
  recommendByPantry(
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.recipesService.recommendByPantry(
      userId,
    );
  }

    @Get('slug/:slug')
    @ApiOperation({
    summary: 'Lấy chi tiết món ăn theo slug',
    })
    findBySlug(
    @Param('slug') slug: string,
    ) {
    return this.recipesService.findBySlug(slug);
    }
  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết món ăn',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.recipesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cập nhật món ăn và công thức',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRecipeDto,
  ) {
    return this.recipesService.update(
      id,
      dto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Xóa món ăn',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.recipesService.remove(id);
  }
}