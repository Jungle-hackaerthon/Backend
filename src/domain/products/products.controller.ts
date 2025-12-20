import { Body, Controller, Param, Post } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-auction-product.dto';
import { CreateAuctionBidDto } from './dto/create-auction-bid.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  createAuctionProduct(@Body() dto: CreateProductDto) {
    return this.productsService.createAuctionProduct(dto);
  }

  @Post(':id/bids')
  createAuctionBid(
    @Param('id') productId: string,
    @Body() dto: CreateAuctionBidDto,
  ) {
    return this.productsService.createAuctionBid(productId, dto);
  }
}
