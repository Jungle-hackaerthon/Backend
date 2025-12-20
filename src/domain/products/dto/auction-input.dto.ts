export interface CreateAuctionProductInput {
  title: string;
  description: string;
  startPrice: number;
  categories: string[];
  imageUrls: string[];
  mapId: string;
}

export interface CreateAuctionBidInput {
  bidAmount: number;
}
