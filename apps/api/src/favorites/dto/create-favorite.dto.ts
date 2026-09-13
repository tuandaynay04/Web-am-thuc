import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsPositive,
} from 'class-validator';

export class CreateFavoriteDto {
  @ApiProperty({
    example: 1,
    description: 'ID món ăn',
  })
  @IsInt()
  @IsPositive()
  recipeId: number;
}