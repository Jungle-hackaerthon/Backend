import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { AuctionBid } from './entities/auction-bid.entity';
import { Product } from './entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, AuctionBid])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
