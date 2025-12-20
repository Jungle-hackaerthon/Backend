import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { RequestStatus } from '../entities/request.entity';

export class QueryRequestsDto {
  @IsInt()
  @Min(0)
  @Max(10)
  @IsOptional()
  @Type(() => Number)
  mapId?: number;

  @IsEnum(RequestStatus)
  @IsOptional()
  status?: RequestStatus = RequestStatus.IN_PROGRESS;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
