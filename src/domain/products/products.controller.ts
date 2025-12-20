import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-auction-product.dto';
import { CreateAuctionBidDto } from './dto/create-auction-bid.dto';
import { UpdateProductStatusDto } from './dto/update-product-status.dto';
import { Product } from './entities/product.entity';
import { AuctionBid } from './entities/auction-bid.entity';
import { SettleAuctionDto } from './dto/settle-auction.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createAuctionProduct(@Body() dto: CreateProductDto): Promise<Product> {
    return this.productsService.createAuctionProduct(dto);
  }

  @Post(':id/bids')
  @HttpCode(HttpStatus.CREATED)
  createAuctionBid(
    @Param('id') productId: string,
    @Body() dto: CreateAuctionBidDto,
  ): Promise<AuctionBid> {
    return this.productsService.createAuctionBid(productId, dto);
  }

  @Get('map/:mapId')
  @HttpCode(HttpStatus.OK)
  getProductsByMapId(
    @Param('mapId', ParseIntPipe) mapId: number,
  ): Promise<Product[]> {
    return this.productsService.getProductsByMapId(mapId);
  }

  @Get(':id/bids')
  @HttpCode(HttpStatus.OK)
  getAuctionBids(@Param('id') productId: string): Promise<AuctionBid[]> {
    return this.productsService.getAuctionBidsByProductId(productId);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  updateProductStatus(
    @Param('id') productId: string,
    @Body() dto: UpdateProductStatusDto,
  ): Promise<Product> {
    return this.productsService.updateProductStatus(productId, dto.status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeProduct(@Param('id') productId: string): Promise<void> {
    return this.productsService.removeProduct(productId);
  }

  @Delete('bids/:bidId')
  @HttpCode(HttpStatus.NO_CONTENT)
  cancelAuctionBid(@Param('bidId') bidId: string): Promise<void> {
    return this.productsService.cancelAuctionBid(bidId);
  }

  @Post(':id/settle')
  @HttpCode(HttpStatus.OK)
  settleAuction(
    @Param('id') productId: string,
    @Body() dto: SettleAuctionDto,
  ): Promise<{
    product: Product;
  }> {
    return this.productsService.settleAuction(productId, dto?.bidId);
  }
}
