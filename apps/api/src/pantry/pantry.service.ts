import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePantryItemDto } from './dto/create-pantry-item.dto';
import { UpdatePantryItemDto } from './dto/update-pantry-item.dto';

@Injectable()
export class PantryService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    userId: number,
    dto: CreatePantryItemDto,
  ) {
    await this.validateUser(userId);
    await this.validateIngredient(dto.ingredientId);

    try {
      return await this.prisma.pantryItem.create({
        data: {
          userId,
          ingredientId: dto.ingredientId,
          quantity: dto.quantity,
          unit: dto.unit.trim(),
          expiresAt: dto.expiresAt,
        },
        include: {
          ingredient: true,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
      throw error;
    }
  }

  async findMine(userId: number) {
    await this.validateUser(userId);

    return this.prisma.pantryItem.findMany({
      where: {
        userId,
      },
      include: {
        ingredient: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(
    userId: number,
    id: number,
  ) {
    const item =
      await this.prisma.pantryItem.findFirst({
        where: {
          id,
          userId,
        },
        include: {
          ingredient: true,
        },
      });

    if (!item) {
      throw new NotFoundException(
        `Không tìm thấy nguyên liệu trong bếp có ID ${id}`,
      );
    }

    return item;
  }

  async update(
    userId: number,
    id: number,
    dto: UpdatePantryItemDto,
  ) {
    await this.findOne(userId, id);

    if (dto.ingredientId !== undefined) {
      await this.validateIngredient(
        dto.ingredientId,
      );
    }

    try {
      return await this.prisma.pantryItem.update({
        where: {
          id,
        },
        data: {
          ingredientId: dto.ingredientId,
          quantity: dto.quantity,
          unit: dto.unit?.trim(),
          expiresAt: dto.expiresAt,
        },
        include: {
          ingredient: true,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
      throw error;
    }
  }

  async remove(
    userId: number,
    id: number,
  ) {
    await this.findOne(userId, id);

    await this.prisma.pantryItem.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Đã xóa nguyên liệu khỏi bếp',
    };
  }

  private async validateUser(
    userId: number,
  ): Promise<void> {
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

  private async validateIngredient(
    ingredientId: number,
  ): Promise<void> {
    const ingredient =
      await this.prisma.ingredient.findUnique({
        where: {
          id: ingredientId,
        },
        select: {
          id: true,
        },
      });

    if (!ingredient) {
      throw new BadRequestException(
        `Nguyên liệu ID ${ingredientId} không tồn tại`,
      );
    }
  }

  private handlePrismaError(error: unknown): void {
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'Nguyên liệu này đã có trong bếp của bạn',
      );
    }

    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException(
        'Không tìm thấy nguyên liệu trong bếp',
      );
    }
  }
}