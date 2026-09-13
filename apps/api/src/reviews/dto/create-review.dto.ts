import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    example: 1,
    description: 'ID món ăn',
  })
  @IsInt()
  @IsPositive()
  recipeId: number;

  @ApiProperty({
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({
    example: 'Món dễ làm, thịt bò mềm và vị vừa ăn.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}