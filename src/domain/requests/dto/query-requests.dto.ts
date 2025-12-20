import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { RequestStatus } from '../entities/request.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryRequestsDto {
  @IsInt()
  @Min(0)
  @Max(10)
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({ description: 'Filter by map ID (1-6)', example: 3 })
  mapId?: number;

  @IsEnum(RequestStatus)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Filter by request status',
    enum: RequestStatus,
    default: RequestStatus.IN_PROGRESS,
  })
  status?: RequestStatus = RequestStatus.IN_PROGRESS;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
  })
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 20,
  })
  limit?: number = 20;
}
