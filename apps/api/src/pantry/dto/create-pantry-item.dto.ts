import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePantryItemDto {
  @ApiProperty({
    example: 1,
    description: 'ID nguyên liệu',
  })
  @IsInt()
  @IsPositive()
  ingredientId: number;

  @ApiProperty({
    example: 300,
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
    example: '2026-08-20T00:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiresAt?: Date;
}