import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Món Việt Nam',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'mon-viet-nam',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  slug: string;

  @ApiPropertyOptional({
    example: 'Các món ăn truyền thống Việt Nam',
  })
  @IsOptional()
  @IsString()
  description?: string;
}