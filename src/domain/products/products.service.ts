import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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

  /**
   * 특정 mapId를 가진 상품 목록들 조회()
   *   AVAILABLE = 'AVAILABLE',
   *   RESERVED = 'RESERVED',
   *  */

  async getProductsByMapId(mapId: number): Promise<Product[]> {
    return await this.productsRepository.find({
      where: {
        mapId,
        status: In([ProductStatus.AVAILABLE, ProductStatus.RESERVED]),
      },
      relations: ['seller'],
    });
  }

  /**
   * AcutionBid 조회 - 상위 3개
   */
  async getAuctionBidsByProductId(productId: string): Promise<AuctionBid[]> {
    return await this.auctionBidsRepository.find({
      where: { product: { id: productId } },
      relations: ['bidder'],
      order: { bidAmount: 'DESC' },
      take: 3,
    });
  }

  /**
   * 상품 삭제
   * - 삭제 후 MapGateway 통해 클라이언트에 알림 전송
   */
  async removeProduct(productId: string): Promise<void> {
    const product = await this.productsRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productsRepository.remove(product);
    this.mapGateway.emitProductRemoved(product.mapId.toString(), product.id);
  }

  /**
   * Product 상태 변경
   * - (예: AVAILABLE -> SOLD)
   */
  async updateProductStatus(
    productId: string,
    status: ProductStatus,
  ): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    product.status = status;
    const updated = await this.productsRepository.save(product);
    this.mapGateway.emitProductUpdated(product.mapId.toString(), updated);
    return updated;
  }

  /* AuctionBid 취소 후 알림 전송 */
  async cancelAuctionBid(bidId: string): Promise<void> {
    const bid = await this.auctionBidsRepository.findOne({
      where: { id: bidId },
      relations: ['product'],
    });

    if (!bid) {
      throw new NotFoundException('Auction bid not found');
    }

    const mapId = bid.product.mapId.toString();
    const bidIdToRemove = bid.id;

    await this.auctionBidsRepository.remove(bid);
    this.mapGateway.emitBidRemoved(mapId, bidIdToRemove);
  }

  /**
   * 유틸들 모음
   * AuctionBid 생성 시 검증 validation 메서드
   */
}
