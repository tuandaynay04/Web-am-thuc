import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class RecipeIngredientDto {
  @ApiProperty({
    example: 1,
    description: 'ID nguyên liệu',
  })
  @IsInt()
  @IsPositive()
  ingredientId: number;

  @ApiProperty({
    example: 300,
    description: 'Định lượng nguyên liệu',
  })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({
    example: 'g',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  unit: string;

  @ApiPropertyOptional({
    example: 'Thái lát mỏng',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}