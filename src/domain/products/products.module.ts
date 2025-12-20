import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { AuctionBid } from './entities/auction-bid.entity';
import { Product } from './entities/product.entity';
import { MapModule } from '../map/map.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Product, AuctionBid]), MapModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
