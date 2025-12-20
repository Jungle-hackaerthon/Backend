import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The title of the request',
    example: 'Please get my package',
  })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'A detailed description of the request',
    example: 'My package is at the front desk of the 3rd floor.',
  })
  description: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: 'The price proposed by the requester',
    example: 150,
    default: 100,
  })
  proposedPrice?: number = 100;

  @IsInt()
  @Min(0)
  @Max(10)
  @ApiProperty({ description: 'The ID of the map (1-6)', example: 3 })
  mapId: number;

  @IsNumber()
  @ApiProperty({ description: 'The x-coordinate on the map', example: 200 })
  xPosition: number;

  @IsNumber()
  @ApiProperty({ description: 'The y-coordinate on the map', example: 300 })
  yPosition: number;
}
