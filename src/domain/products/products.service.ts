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
      imageUrls: dto.imageUrls ?? [],
      startPrice: dto.startPrice,
      deadline: dto.deadline,
      status: ProductStatus.AVAILABLE,
    });

    const saved = await this.productsRepository.save(product);
    const savedWithSeller = await this.productsRepository.findOne({
      where: { id: saved.id },
      relations: ['seller'],
    });
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
    const payload = savedWithSeller ?? saved;
    this.mapGateway.emitProductCreated(dto.mapId.toString(), payload);
    return payload;
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
   * AuctionBid 조회 - 상위 3개
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
    const updatedWithSeller = await this.productsRepository.findOne({
      where: { id: updated.id },
      relations: ['seller'],
    });
    const payload = updatedWithSeller ?? updated;
    this.mapGateway.emitProductUpdated(product.mapId.toString(), payload);
    return payload;
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
   * 경매 낙찰 처리
   * - 최고 입찰자 찾기
   * - 포인트 거래 (낙찰자 → 판매자)
   * - Product status SOLD로 변경
   * - MapGateway로 auction:ended 이벤트 발송
   */
  async settleAuction(productId: string): Promise<{
    product: Product;
  }> {
    // 상품 조회
    const product = await this.productsRepository.findOne({
      where: { id: productId },
      relations: ['seller'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.status === ProductStatus.SOLD) {
      throw new BadRequestException('Product is already sold');
    }

    // 최고 입찰자 찾기
    const highestBid = await this.auctionBidsRepository.findOne({
      where: { product: { id: productId } },
      relations: ['bidder'],
      order: { bidAmount: 'DESC' },
    });

    // 입찰자가 없는 경우 - 상품만 SOLD로 변경
    if (!highestBid) {
      product.status = ProductStatus.SOLD;
      const updated = await this.productsRepository.save(product);

      // 이벤트 발송 (낙찰자 없음)
      this.mapGateway.emitAuctionEnded(product.mapId.toString(), {
        productId: product.id,
        winnerId: null,
        winningBid: null,
        sellerId: product.seller.id,
      });

      return {
        product: updated,
      };
    }

    // 상품 상태 변경
    product.status = ProductStatus.SOLD;
    const updated = await this.productsRepository.save(product);

    // 이벤트 발송
    this.mapGateway.emitAuctionEnded(product.mapId.toString(), {
      productId: product.id,
      winnerId: highestBid.bidder.id,
      winningBid: highestBid.bidAmount,
      sellerId: product.seller.id,
    });

    return {
      product: updated,
    };
  }

  /**
   * 유틸들 모음
   * AuctionBid 생성 시 검증 validation 메서드
   */
}
