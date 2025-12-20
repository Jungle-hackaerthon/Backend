import { IsOptional, IsString } from 'class-validator';

export class SettleAuctionDto {
  @IsOptional()
  @IsString()
  bidId?: string;
}
