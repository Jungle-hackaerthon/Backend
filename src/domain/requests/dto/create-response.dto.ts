import { IsNumber, IsOptional } from 'class-validator';

export class CreateResponseDto {
  @IsNumber()
  @IsOptional()
  proposedPrice?: number;
}
