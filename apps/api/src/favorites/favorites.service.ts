import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    userId: number,
    dto: CreateFavoriteDto,
  ) {
    await this.validateUser(userId);
    await this.validateRecipe(dto.recipeId);

    try {
      return await this.prisma.favorite.create({
        data: {
          userId,
          recipeId: dto.recipeId,
        },
        include: {
          recipe: {
            include: {
              category: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Món ăn này đã có trong danh sách yêu thích',
        );
      }

      throw error;
    }
  }

  async findMine(userId: number) {
    await this.validateUser(userId);

    return this.prisma.favorite.findMany({
      where: {
        userId,
      },
      include: {
        recipe: {
          include: {
            category: true,
            ingredients: {
              include: {
                ingredient: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async remove(
    userId: number,
    recipeId: number,
  ) {
    const favorite =
      await this.prisma.favorite.findUnique({
        where: {
          userId_recipeId: {
            userId,
            recipeId,
          },
        },
      });

    if (!favorite) {
      throw new NotFoundException(
        'Món ăn không có trong danh sách yêu thích',
      );
    }

    await this.prisma.favorite.delete({
      where: {
        id: favorite.id,
      },
    });

    return {
      message: 'Đã xóa món ăn khỏi danh sách yêu thích',
    };
  }

  private async validateUser(
    userId: number,
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new BadRequestException(
        `Người dùng ID ${userId} không tồn tại`,
      );
    }

    if (!user.isActive) {
      throw new BadRequestException(
        'Tài khoản người dùng đã bị khóa',
      );
    }
  }

  private async validateRecipe(
    recipeId: number,
  ) {
    const recipe = await this.prisma.recipe.findUnique({
      where: {
        id: recipeId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!recipe) {
      throw new BadRequestException(
        `Món ăn ID ${recipeId} không tồn tại`,
      );
    }

    if (recipe.status !== 'PUBLISHED') {
      throw new BadRequestException(
        'Món ăn này chưa được công khai',
      );
    }
  }
}