import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import {
  RecipeDifficulty,
  RecipeStatus,
} from '../../../generated/prisma/client';

import { RecipeIngredientDto } from './recipe-ingredient.dto';
import { RecipeStepDto } from './recipe-step.dto';

export class CreateRecipeDto {
  @ApiProperty({
    example: 'Bò xào hành tây',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: 'bo-xao-hanh-tay',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(220)
  slug: string;

  @ApiPropertyOptional({
    example: 'Món bò xào hành tây đơn giản, thơm ngon.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/bo-xao-hanh-tay.jpg',
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  imageUrl?: string;

  @ApiProperty({
    example: 2,
  })
  @IsInt()
  @IsPositive()
  servings: number;

  @ApiPropertyOptional({
    example: 15,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  prepMinutes?: number;

  @ApiPropertyOptional({
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  cookMinutes?: number;

  @ApiPropertyOptional({
    enum: RecipeDifficulty,
    example: RecipeDifficulty.EASY,
  })
  @IsOptional()
  @IsEnum(RecipeDifficulty)
  difficulty?: RecipeDifficulty;

  @ApiPropertyOptional({
    enum: RecipeStatus,
    example: RecipeStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(RecipeStatus)
  status?: RecipeStatus;

  @ApiProperty({
    example: 1,
    description: 'ID danh mục món ăn',
  })
  @IsInt()
  @IsPositive()
  categoryId: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID người tạo công thức',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  authorId?: number;

  @ApiProperty({
    type: [RecipeIngredientDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RecipeIngredientDto)
  ingredients: RecipeIngredientDto[];

  @ApiProperty({
    type: [RecipeStepDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RecipeStepDto)
  steps: RecipeStepDto[];
}