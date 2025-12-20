import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateRequestDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsOptional()
  proposedPrice?: number = 100;

  @IsInt()
  @Min(0)
  @Max(10)
  mapId: number;

  @IsNumber()
  xPosition: number;

  @IsNumber()
  yPosition: number;
}
