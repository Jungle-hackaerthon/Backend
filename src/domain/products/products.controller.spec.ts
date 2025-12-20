import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-auction-product.dto';
import { CreateAuctionBidDto } from './dto/create-auction-bid.dto';

describe('ProductsController', () => {
  let controller: ProductsController;
  let productsService: ProductsService;
  let createAuctionProduct: jest.Mock;
  let createAuctionBid: jest.Mock;

  beforeEach(() => {
    createAuctionProduct = jest.fn();
    createAuctionBid = jest.fn();
    productsService = {
      createAuctionProduct,
      createAuctionBid,
    } as unknown as ProductsService;
    controller = new ProductsController(productsService);
  });

  it('passes the product DTO directly to the service', async () => {
    const dto: CreateProductDto = {
      sellerId: 'seller-1',
      mapId: 25,
      xPosition: 10,
      yPosition: 20,
      title: 'Title',
      description: 'Desc',
      imageUrls: ['img1'],
      startPrice: 500,
      deadline: new Date('2025-02-02T00:00:00.000Z'),
    };

    await controller.createAuctionProduct(dto);

    expect(createAuctionProduct).toHaveBeenCalledWith(dto);
  });

  it('passes the bid DTO directly to the service along with the product id', async () => {
    const dto: CreateAuctionBidDto = {
      bidderId: 'bidder-1',
      bidAmount: 700,
    };

    await controller.createAuctionBid('product-1', dto);

    expect(createAuctionBid).toHaveBeenCalledWith('product-1', dto);
  });
});
