import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuctionBid } from './entities/auction-bid.entity';
import { Product, ProductStatus } from './entities/product.entity';

import { CreateProductDto } from './dto/create-auction-product.dto';
import { CreateAuctionBidDto } from './dto/create-auction-bid.dto';
import { MapGateway } from '../map/map.gateway.js';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(AuctionBid)
    private readonly auctionBidsRepository: Repository<AuctionBid>,
    private readonly mapGateway: MapGateway,
  ) {}

  async createAuctionProduct(dto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create({
      seller: { id: dto.sellerId },
      mapId: dto.mapId,
      xPosition: dto.xPosition,
      yPosition: dto.yPosition,
      title: dto.title,
      description: dto.description,
      imageUrls: dto.imageUrls,
      startPrice: dto.startPrice,
      deadline: dto.deadline,
      status: ProductStatus.AVAILABLE,
    });

    const saved = await this.productsRepository.save(product);
    // const payload: MapProductCreatedPayload = {
    //   productId: saved.id,
    //   mapId: saved.mapId,
    //   sellerId: dto.sellerId,
    //   title: saved.title,
    //   description: saved.description,
    //   imageUrls: saved.imageUrls,
    //   xPosition: saved.xPosition ?? null,
    //   yPosition: saved.yPosition ?? null,
    //   startPrice: saved.start_price ?? null,
    //   deadline: saved.deadline,
    //   status: saved.status,
    //   createdAt: saved.createdAt,
    // };
    // 귀찮으니 그냥 entity
    this.mapGateway.emitProductCreated(dto.mapId.toString(), saved);
    return saved;
  }

  async createAuctionBid(
    productId: string,
    dto: CreateAuctionBidDto,
  ): Promise<AuctionBid> {
    const product = await this.productsRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.status !== ProductStatus.AVAILABLE) {
      throw new BadRequestException('Product is not available for bidding');
    }

    if (product.deadline && new Date() > product.deadline) {
      throw new BadRequestException('Auction has ended');
    }

    if (dto.bidAmount <= product.startPrice) {
      throw new BadRequestException(
        'Bid amount must be higher than start price',
      );
    }

    const bid = this.auctionBidsRepository.create({
      product: { id: productId },
      bidder: { id: dto.bidderId },
      bidAmount: dto.bidAmount,
    });

    const saved = await this.auctionBidsRepository.save(bid);
    this.mapGateway.emitBidCreated(product.mapId.toString(), saved);
    return saved;
  }
}
