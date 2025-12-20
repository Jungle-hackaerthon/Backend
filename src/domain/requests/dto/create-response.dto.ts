import { IsNumber, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateResponseDto {
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The price proposed by the helper',
    example: 100,
  })
  proposedPrice?: number;
}
