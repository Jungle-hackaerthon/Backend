import { IsInt, IsString, Min } from 'class-validator';

export class CreateAuctionBidDto {
  @IsString()
  bidderId: string;

  @IsInt()
  @Min(0)
  bidAmount: number;
}
