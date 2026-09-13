import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class RecipeStepDto {
  @ApiProperty({
    example: 1,
  })
  @IsInt()
  @IsPositive()
  stepNumber: number;

  @ApiProperty({
    example: 'Thái thịt bò thành từng lát mỏng.',
  })
  @IsString()
  @IsNotEmpty()
  instruction: string;

  @ApiPropertyOptional({
    example: 'https://example.com/steps/step-1.jpg',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}