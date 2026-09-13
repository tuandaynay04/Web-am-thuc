import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateIngredientDto {
  @ApiProperty({
    example: 'Thịt bò',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiProperty({
    example: 'thit-bo',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(170)
  slug: string;

  @ApiPropertyOptional({
    example: 'Thịt bò tươi dùng cho các món xào, nướng và hầm.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/images/thit-bo.jpg',
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  imageUrl?: string;
}