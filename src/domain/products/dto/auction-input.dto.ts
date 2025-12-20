export interface CreateAuctionProductInput {
  title: string;
  description: string;
  price: number;
  startPrice: number;
  categories: string[];
  imageUrls: string[];
  mapId: string;
}

export interface CreateAuctionBidInput {
  bidAmount: number;
}
