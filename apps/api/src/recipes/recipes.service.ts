import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Injectable()
export class RecipesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRecipeDto) {
    await this.validateRelations(dto);

this.validateDuplicateIngredients(dto.ingredients);
this.validateDuplicateSteps(dto.steps);

    try {
      return await this.prisma.recipe.create({
        data: {
          title: dto.title.trim(),
          slug: dto.slug.trim().toLowerCase(),
          description: dto.description?.trim(),
          imageUrl: dto.imageUrl?.trim(),

          servings: dto.servings,
          prepMinutes: dto.prepMinutes,
          cookMinutes: dto.cookMinutes,
          difficulty: dto.difficulty,
          status: dto.status,

          categoryId: dto.categoryId,
          authorId: dto.authorId,

          ingredients: {
            create: dto.ingredients.map((item) => ({
              ingredientId: item.ingredientId,
              quantity: item.quantity,
              unit: item.unit.trim(),
              note: item.note?.trim(),
            })),
          },

          steps: {
            create: dto.steps.map((step) => ({
              stepNumber: step.stepNumber,
              instruction: step.instruction.trim(),
              imageUrl: step.imageUrl?.trim(),
            })),
          },
        },

        include: this.recipeInclude,
      });
    } catch (error) {
      this.handlePrismaError(error);
      throw error;
    }
  }

    findAll() {
    return this.prisma.recipe.findMany({
      where: {
        status: 'PUBLISHED',
      },
      include: this.recipeInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findAllForAdmin() {
    return this.prisma.recipe.findMany({
      include: this.recipeInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: this.recipeInclude,
    });

    if (!recipe) {
      throw new NotFoundException(
        `Không tìm thấy công thức có ID ${id}`,
      );
    }

    return recipe;
  }

  async update(id: number, dto: UpdateRecipeDto) {
    await this.findOne(id);

    if (dto.categoryId !== undefined) {
      const category = await this.prisma.category.findUnique({
        where: {
          id: dto.categoryId,
        },
        select: {
          id: true,
        },
      });

      if (!category) {
        throw new BadRequestException(
          `Danh mục ID ${dto.categoryId} không tồn tại`,
        );
      }
    }

    if (dto.authorId !== undefined) {
      const author = await this.prisma.user.findUnique({
        where: {
          id: dto.authorId,
        },
        select: {
          id: true,
        },
      });

      if (!author) {
        throw new BadRequestException(
          `Người dùng ID ${dto.authorId} không tồn tại`,
        );
      }
    }

        if (dto.ingredients !== undefined) {
    this.validateDuplicateIngredients(dto.ingredients);

    await this.validateIngredients(dto.ingredients);
    }

    if (dto.steps !== undefined) {
    this.validateDuplicateSteps(dto.steps);
    }

    try {
      return await this.prisma.recipe.update({
        where: { id },

        data: {
          title: dto.title?.trim(),
          slug: dto.slug?.trim().toLowerCase(),
          description: dto.description?.trim(),
          imageUrl: dto.imageUrl?.trim(),

          servings: dto.servings,
          prepMinutes: dto.prepMinutes,
          cookMinutes: dto.cookMinutes,
          difficulty: dto.difficulty,
          status: dto.status,

          categoryId: dto.categoryId,
          authorId: dto.authorId,

          ...(dto.ingredients !== undefined && {
            ingredients: {
              deleteMany: {},
              create: dto.ingredients.map((item) => ({
                ingredientId: item.ingredientId,
                quantity: item.quantity,
                unit: item.unit.trim(),
                note: item.note?.trim(),
              })),
            },
          }),

          ...(dto.steps !== undefined && {
            steps: {
              deleteMany: {},
              create: dto.steps.map((step) => ({
                stepNumber: step.stepNumber,
                instruction: step.instruction.trim(),
                imageUrl: step.imageUrl?.trim(),
              })),
            },
          }),
        },

        include: this.recipeInclude,
      });
    } catch (error) {
      this.handlePrismaError(error);
      throw error;
    }
  }
async findBySlug(slug: string) {
  const recipe = await this.prisma.recipe.findUnique({
    where: {
      slug,
    },
    include: {
      category: true,
      author: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
        },
      },
      ingredients: {
        include: {
          ingredient: true,
        },
        orderBy: {
          id: 'asc',
        },
      },
      steps: {
        orderBy: {
          stepNumber: 'asc',
        },
      },
    },
  });

  if (!recipe) {
    throw new NotFoundException(
      `Không tìm thấy món ăn có slug "${slug}"`,
    );
  }

  return recipe;
}
  async remove(id: number) {
    await this.findOne(id);

    try {
      return await this.prisma.recipe.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error);
      throw error;
    }
  }

  private readonly recipeInclude = {
    category: true,

    author: {
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
      },
    },

    ingredients: {
      include: {
        ingredient: true,
      },
    },

    steps: {
      orderBy: {
        stepNumber: 'asc' as const,
      },
    },
  };

  private async validateRelations(
    dto: CreateRecipeDto,
  ): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: {
        id: dto.categoryId,
      },
      select: {
        id: true,
      },
    });

    if (!category) {
      throw new BadRequestException(
        `Danh mục ID ${dto.categoryId} không tồn tại`,
      );
    }

    if (dto.authorId !== undefined) {
      const author = await this.prisma.user.findUnique({
        where: {
          id: dto.authorId,
        },
        select: {
          id: true,
        },
      });

      if (!author) {
        throw new BadRequestException(
          `Người dùng ID ${dto.authorId} không tồn tại`,
        );
      }
    }

    await this.validateIngredients(dto.ingredients);
  }

  private async validateIngredients(
    ingredients: CreateRecipeDto['ingredients'],
  ): Promise<void> {
    const ingredientIds = ingredients.map(
      (item) => item.ingredientId,
    );

    const existingIngredients =
      await this.prisma.ingredient.findMany({
        where: {
          id: {
            in: ingredientIds,
          },
        },
        select: {
          id: true,
        },
      });

    const existingIds = new Set(
      existingIngredients.map((ingredient) => ingredient.id),
    );

    const missingIds = ingredientIds.filter(
      (id) => !existingIds.has(id),
    );

    if (missingIds.length > 0) {
      throw new BadRequestException(
        `Nguyên liệu không tồn tại: ${[
          ...new Set(missingIds),
        ].join(', ')}`,
      );
    }
  }

  private validateDuplicateIngredients(
  ingredients: CreateRecipeDto['ingredients'],
): void {
  const ids = ingredients.map(
    (item) => item.ingredientId,
  );

  if (new Set(ids).size !== ids.length) {
    throw new BadRequestException(
      'Một nguyên liệu không được xuất hiện nhiều lần trong cùng công thức',
    );
  }
    }

  private validateDuplicateSteps(
  steps: CreateRecipeDto['steps'],
): void {
  const stepNumbers = steps.map(
    (step) => step.stepNumber,
  );

  if (new Set(stepNumbers).size !== stepNumbers.length) {
    throw new BadRequestException(
      'Số thứ tự các bước nấu không được trùng nhau',
    );
  }
    }
    private normalizeQuantity(
  quantity: number,
  unit: string | null,
): {
  quantity: number;
  unit: string | null;
} {
  if (!unit) {
    return {
      quantity,
      unit: null,
    };
  }

  const normalizedUnit = unit
    .trim()
    .toLowerCase();

  switch (normalizedUnit) {
    case 'kg':
      return {
        quantity: quantity * 1000,
        unit: 'g',
      };

    case 'g':
      return {
        quantity,
        unit: 'g',
      };

    case 'l':
      return {
        quantity: quantity * 1000,
        unit: 'ml',
      };

    case 'ml':
      return {
        quantity,
        unit: 'ml',
      };

    default:
      return {
        quantity,
        unit: normalizedUnit,
      };
  }
}

private compareQuantity(
  requiredQuantity: number | null,
  requiredUnit: string | null,
  availableQuantity: number | null,
  availableUnit: string | null,
): {
  compatible: boolean;
  enough: boolean;
  normalizedRequiredQuantity: number | null;
  normalizedAvailableQuantity: number | null;
  normalizedUnit: string | null;
} {
  if (
    requiredQuantity === null ||
    availableQuantity === null
  ) {
    return {
      compatible: true,
      enough: true,
      normalizedRequiredQuantity: requiredQuantity,
      normalizedAvailableQuantity: availableQuantity,
      normalizedUnit:
        requiredUnit ?? availableUnit ?? null,
    };
  }

  const required = this.normalizeQuantity(
    requiredQuantity,
    requiredUnit,
  );

  const available = this.normalizeQuantity(
    availableQuantity,
    availableUnit,
  );

  if (required.unit !== available.unit) {
    return {
      compatible: false,
      enough: false,
      normalizedRequiredQuantity:
        required.quantity,
      normalizedAvailableQuantity:
        available.quantity,
      normalizedUnit: required.unit,
    };
  }

  return {
    compatible: true,
    enough:
      available.quantity >= required.quantity,
    normalizedRequiredQuantity:
      required.quantity,
    normalizedAvailableQuantity:
      available.quantity,
    normalizedUnit: required.unit,
  };
    }
  private handlePrismaError(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'Slug công thức hoặc dữ liệu liên quan đã tồn tại',
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      throw new BadRequestException(
        'Dữ liệu liên kết của công thức không hợp lệ',
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException(
        'Không tìm thấy công thức',
      );
    }
  }
  async recommendByPantry(userId: number) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      isActive: true,
    },
  });

  if (!user) {
    throw new NotFoundException(
      `Không tìm thấy người dùng có ID ${userId}`,
    );
  }

  if (!user.isActive) {
    throw new BadRequestException(
      'Tài khoản người dùng đã bị khóa',
    );
  }

    const pantryItems = await this.prisma.pantryItem.findMany({
    where: {
        userId,
        OR: [
        {
            expiresAt: null,
        },
        {
            expiresAt: {
            gt: new Date(),
            },
        },
        ],
    },
    });

  if (pantryItems.length === 0) {
    return [];
  }

  const recipes = await this.prisma.recipe.findMany({
    where: {
      status: 'PUBLISHED',
    },
    include: {
      category: true,
      ingredients: {
        include: {
          ingredient: true,
        },
      },
    },
  });

  const pantryMap = new Map(
    pantryItems.map((item) => [
      item.ingredientId,
      item,
    ]),
  );

  const recommendations = recipes.map((recipe) => {
    const availableIngredients: {
      ingredientId: number;
      name: string;
      requiredQuantity: number | null;
      availableQuantity: number | null;
      unit: string | null;
    }[] = [];

    const missingIngredients: {
      ingredientId: number;
      name: string;
      requiredQuantity: number | null;
      unit: string | null;
      reason: string;
    }[] = [];

    for (const recipeIngredient of recipe.ingredients) {
      const pantryItem = pantryMap.get(
        recipeIngredient.ingredientId,
      );

      if (!pantryItem) {
        missingIngredients.push({
          ingredientId: recipeIngredient.ingredientId,
          name: recipeIngredient.ingredient.name,
          requiredQuantity:
            recipeIngredient.quantity === null
              ? null
              : Number(recipeIngredient.quantity),
          unit: recipeIngredient.unit,
          reason: 'NOT_AVAILABLE',
        });

        continue;
      }

      const requiredQuantity =
  recipeIngredient.quantity === null
    ? null
    : Number(recipeIngredient.quantity);

const availableQuantity =
  pantryItem.quantity === null
    ? null
    : Number(pantryItem.quantity);

const quantityCheck = this.compareQuantity(
  requiredQuantity,
  recipeIngredient.unit,
  availableQuantity,
  pantryItem.unit,
);

if (!quantityCheck.compatible) {
  missingIngredients.push({
    ingredientId: recipeIngredient.ingredientId,
    name: recipeIngredient.ingredient.name,
    requiredQuantity,
    unit: recipeIngredient.unit,
    reason: 'UNIT_MISMATCH',
  });

  continue;
}

if (!quantityCheck.enough) {
  missingIngredients.push({
    ingredientId: recipeIngredient.ingredientId,
    name: recipeIngredient.ingredient.name,
    requiredQuantity,
    unit: recipeIngredient.unit,
    reason: 'INSUFFICIENT_QUANTITY',
  });

  continue;
}

availableIngredients.push({
  ingredientId: recipeIngredient.ingredientId,
  name: recipeIngredient.ingredient.name,
  requiredQuantity,
  availableQuantity,
  unit: recipeIngredient.unit,
    });
    }

    const totalIngredients = recipe.ingredients.length;
    const matchedIngredients = availableIngredients.length;

    const matchPercentage =
      totalIngredients === 0
        ? 0
        : Number(
            (
              (matchedIngredients / totalIngredients) *
              100
            ).toFixed(2),
          );

    return {
      recipe: {
        id: recipe.id,
        title: recipe.title,
        slug: recipe.slug,
        description: recipe.description,
        imageUrl: recipe.imageUrl,
        servings: recipe.servings,
        prepMinutes: recipe.prepMinutes,
        cookMinutes: recipe.cookMinutes,
        difficulty: recipe.difficulty,
        category: recipe.category,
      },

      matchPercentage,
      canCook:
        totalIngredients > 0 &&
        missingIngredients.length === 0,

      matchedIngredients,
      totalIngredients,

      availableIngredients,
      missingIngredients,
    };
  });

  return recommendations.sort(
    (a, b) =>
      b.matchPercentage - a.matchPercentage,
  );
}
}