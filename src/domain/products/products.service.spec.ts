import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from './products.service';
import { Product, ProductStatus } from './entities/product.entity';
import { AuctionBid } from './entities/auction-bid.entity';
import { CreateProductDto } from './dto/create-auction-product.dto';
import { CreateAuctionBidDto } from './dto/create-auction-bid.dto';

describe('ProductsService (TDD)', () => {
  let service: ProductsService;
  let productsRepository: Repository<Product>;
  let auctionBidsRepository: Repository<AuctionBid>;
  const mapGateway = {
    emitProductCreated: jest.fn(),
    emitBidCreated: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AuctionBid),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        { provide: MapGateway, useValue: mapGateway },
      ],
    }).compile();

    service = module.get(ProductsService);
    productsRepository = module.get(getRepositoryToken(Product));
    auctionBidsRepository = module.get(getRepositoryToken(AuctionBid));
  });

  it('given_productDto_when_create_then_persists_entity_fields_and_emits_event', async () => {
    const dto: CreateProductDto = {
      sellerId: 'seller-1',
      mapId: 101,
      xPosition: 5,
      yPosition: 7,
      title: 'Auction Item',
      description: 'Item description',
      imageUrls: ['img'],
      categories: ['gadgets'],
      price: 1000,
      startPrice: 300,
      deadline: new Date('2025-01-01T00:00:00.000Z'),
    };

    const created = {
      id: 'product-1',
      seller: { id: dto.sellerId },
      map: { id: dto.mapId },
      xPosition: dto.xPosition,
      yPosition: dto.yPosition,
      title: dto.title,
      description: dto.description,
      imageUrls: dto.imageUrls,
      categories: dto.categories,
      price: dto.price,
      startPrice: dto.startPrice,
      currentPrice: dto.startPrice,
      deadline: dto.deadline,
      status: ProductStatus.AVAILABLE,
      createdAt: new Date('2024-12-31T00:00:00.000Z'),
    } as Product;

    jest.spyOn(productsRepository, 'create').mockReturnValue(created);
    jest.spyOn(productsRepository, 'save').mockResolvedValue(created);

    const result = await service.createAuctionProduct(dto);

    expect(productsRepository.create).toHaveBeenCalledWith({
      seller: { id: dto.sellerId },
      map: { id: dto.mapId },
      xPosition: dto.xPosition,
      yPosition: dto.yPosition,
      title: dto.title,
      description: dto.description,
      imageUrls: dto.imageUrls,
      categories: dto.categories,
      price: dto.price,
      startPrice: dto.startPrice,
      currentPrice: dto.startPrice,
      deadline: dto.deadline,
      status: ProductStatus.AVAILABLE,
    });
    expect(result).toBe(created);
    expect(mapGateway.emitProductCreated).toHaveBeenCalledWith(
      dto.mapId.toString(),
      {
        productId: created.id,
        mapId: created.mapId,
        sellerId: dto.sellerId,
        title: created.title,
        description: created.description,
        imageUrls: created.imageUrls,
        xPosition: created.xPosition ?? null,
        yPosition: created.yPosition ?? null,
        startPrice: created.startPrice ?? null,
        deadline: created.deadline,
        status: created.status,
        createdAt: created.createdAt,
      },
    );
  });

  it('given_bid_when_create_then_persists_and_emits_with_map_id', async () => {
    const product = {
      id: 'product-1',
      map: { id: 10 },
      currentPrice: 500,
    } as Product;
    const bidDto: CreateAuctionBidDto = {
      bidderId: 'bidder-1',
      bidAmount: 800,
    };
    const createdBid = {
      id: 'bid-1',
      product,
      bidder: { id: bidDto.bidderId },
      bidAmount: bidDto.bidAmount,
      createdAt: new Date('2024-12-31T00:00:00.000Z'),
    } as AuctionBid;

    jest.spyOn(productsRepository, 'findOne').mockResolvedValue(product);
    jest.spyOn(auctionBidsRepository, 'create').mockReturnValue(createdBid);
    jest.spyOn(auctionBidsRepository, 'save').mockResolvedValue(createdBid);

    const result = await service.createAuctionBid(product.id, bidDto);

    expect(auctionBidsRepository.create).toHaveBeenCalledWith({
      product: { id: product.id },
      bidder: { id: bidDto.bidderId },
      bidAmount: bidDto.bidAmount,
    });
    expect(result).toBe(createdBid);
    expect(mapGateway.emitBidCreated).toHaveBeenCalledWith(
      product.map.id.toString(),
      {
        bidId: createdBid.id,
        productId: product.id,
        bidderId: bidDto.bidderId,
        bidAmount: createdBid.bidAmount,
        createdAt: createdBid.createdAt,
      },
    );
    expect(productsRepository.update).toHaveBeenCalledWith(product.id, {
      currentPrice: bidDto.bidAmount,
    });
  });
});
