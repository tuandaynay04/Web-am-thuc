

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

@Injectable()
export class IngredientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateIngredientDto) {
    try {
      return await this.prisma.ingredient.create({
        data: {
          name: dto.name.trim(),
          slug: dto.slug.trim().toLowerCase(),
          description: dto.description?.trim(),
          imageUrl: dto.imageUrl?.trim(),
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
      throw error;
    }
  }

  findAll() {
    return this.prisma.ingredient.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id },
    });

    if (!ingredient) {
      throw new NotFoundException(
        `Không tìm thấy nguyên liệu có ID ${id}`,
      );
    }

    return ingredient;
  }

  async update(id: number, dto: UpdateIngredientDto) {
    await this.findOne(id);

    try {
      return await this.prisma.ingredient.update({
        where: { id },
        data: {
          name: dto.name?.trim(),
          slug: dto.slug?.trim().toLowerCase(),
          description: dto.description?.trim(),
          imageUrl: dto.imageUrl?.trim(),
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      return await this.prisma.ingredient.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error);
      throw error;
    }
  }

  private handlePrismaError(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'Tên hoặc slug nguyên liệu đã tồn tại',
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      throw new ConflictException(
        'Không thể xóa nguyên liệu đang được sử dụng',
      );
    }
  }
}