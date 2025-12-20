import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  sellerId: string;

  @IsInt()
  mapId: number;

  @IsOptional()
  @IsInt()
  xPosition?: number;

  @IsOptional()
  @IsInt()
  yPosition?: number;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  categories: string[];

  @IsInt()
  @Min(0)
  price: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  imageUrls: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  startPrice?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  deadline?: Date;
}
