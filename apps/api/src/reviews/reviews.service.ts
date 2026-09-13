import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    userId: number,
    dto: CreateReviewDto,
  ) {
    await this.validateUser(userId);
    await this.validateRecipe(dto.recipeId);

    try {
      return await this.prisma.review.create({
        data: {
          userId,
          recipeId: dto.recipeId,
          rating: dto.rating,
          comment: dto.comment?.trim(),
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
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
          'Bạn đã đánh giá món ăn này trước đó',
        );
      }

      throw error;
    }
  }

  async findByRecipe(recipeId: number) {
    await this.validateRecipe(recipeId);

    return this.prisma.review.findMany({
      where: {
        recipeId,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getSummary(recipeId: number) {
    await this.validateRecipe(recipeId);

    const reviews = await this.prisma.review.findMany({
      where: {
        recipeId,
      },
      select: {
        rating: true,
      },
    });

    const total = reviews.length;

    const average =
      total === 0
        ? 0
        : reviews.reduce(
            (sum, review) => sum + review.rating,
            0,
          ) / total;

    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    for (const review of reviews) {
      distribution[
        review.rating as keyof typeof distribution
      ]++;
    }

    return {
      recipeId,
      averageRating: Number(
        average.toFixed(2),
      ),
      totalReviews: total,
      distribution,
    };
  }

  async update(
    userId: number,
    id: number,
    dto: UpdateReviewDto,
  ) {
    const review =
      await this.prisma.review.findFirst({
        where: {
          id,
          userId,
        },
      });

    if (!review) {
      throw new NotFoundException(
        `Không tìm thấy đánh giá có ID ${id}`,
      );
    }

    return this.prisma.review.update({
      where: {
        id,
      },
      data: {
        rating: dto.rating,
        comment: dto.comment?.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async remove(
    userId: number,
    id: number,
  ) {
    const review =
      await this.prisma.review.findFirst({
        where: {
          id,
          userId,
        },
      });

    if (!review) {
      throw new NotFoundException(
        `Không tìm thấy đánh giá có ID ${id}`,
      );
    }

    await this.prisma.review.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Đã xóa đánh giá',
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