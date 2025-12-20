import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MinDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  sellerId: string;

  @IsInt()
  mapId: number;

  @IsInt()
  xPosition: number;

  @IsInt()
  yPosition: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

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
  startPrice: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @MinDate(new Date())
  deadline?: Date;
}
