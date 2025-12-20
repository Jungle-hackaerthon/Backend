import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '../src/config/env.config';
import { ProductsModule } from '../src/domain/products/products.module';
import { MapModule } from '../src/domain/map/map.module';
import { UsersModule } from '../src/domain/users/users.module';
import { Map } from '../src/domain/map/map.entity';
import { User } from '../src/domain/users/user.entity';
import { Product } from '../src/domain/products/entities/product.entity';
import { AuctionBid } from '../src/domain/products/entities/auction-bid.entity';

describe('Products (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(typeOrmConfig),
        ProductsModule,
        MapModule,
        UsersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await dataSource.query(
      'TRUNCATE TABLE auction_bids, products, users, maps RESTART IDENTITY CASCADE',
    );
  });

  it('POST /products', async () => {
    const mapRepository = dataSource.getRepository(Map);
    const userRepository = dataSource.getRepository(User);

    const map = await mapRepository.save({
      name: 'Test Map',
      imageUrl: 'map.png',
    });
    const seller = await userRepository.save({
      email: 'seller@example.com',
      nickname: 'seller',
      hashedPassword: 'hashed',
      avatarUrl: 'default.png',
      pointBalance: 0,
      isOnline: false,
      currentMap: map,
      xPosition: 0,
      yPosition: 0,
    });

    const payload = {
      sellerId: seller.id,
      mapId: map.id,
      title: 'Auction Item',
      description: 'Item description',
      price: 1000,
      startPrice: 500,
      categories: ['cat'],
      imageUrls: ['img'],
    };

    const response = await request(app.getHttpServer())
      .post('/products')
      .send(payload)
      .expect(201);

    const productRepository = dataSource.getRepository(Product);
    const saved = await productRepository.findOne({
      where: { id: response.body.id },
      relations: ['map', 'seller'],
    });

    expect(saved).toBeTruthy();
    expect(saved?.currentPrice).toBe(payload.startPrice);
    expect(saved?.map.id).toBe(map.id);
    expect(saved?.seller.id).toBe(seller.id);
  });

  it('POST /products/:id/bids', async () => {
    const mapRepository = dataSource.getRepository(Map);
    const userRepository = dataSource.getRepository(User);
    const productRepository = dataSource.getRepository(Product);
    const bidRepository = dataSource.getRepository(AuctionBid);

    const map = await mapRepository.save({
      name: 'Test Map',
      imageUrl: 'map.png',
    });
    const seller = await userRepository.save({
      email: 'seller@example.com',
      nickname: 'seller',
      hashedPassword: 'hashed',
      avatarUrl: 'default.png',
      pointBalance: 0,
      isOnline: false,
      currentMap: map,
      xPosition: 0,
      yPosition: 0,
    });
    const bidder = await userRepository.save({
      email: 'bidder@example.com',
      nickname: 'bidder',
      hashedPassword: 'hashed',
      avatarUrl: 'default.png',
      pointBalance: 0,
      isOnline: false,
      currentMap: map,
      xPosition: 0,
      yPosition: 0,
    });
    const product = await productRepository.save({
      seller,
      map,
      title: 'Auction Item',
      description: 'Item description',
      price: 1000,
      startPrice: 500,
      currentPrice: 500,
      categories: ['cat'],
      imageUrls: ['img'],
      status: 'AVAILABLE',
    });

    const payload = { bidderId: bidder.id, bidAmount: 800 };

    const response = await request(app.getHttpServer())
      .post(`/products/${product.id}/bids`)
      .send(payload)
      .expect(201);

    const savedBid = await bidRepository.findOne({
      where: { id: response.body.id },
      relations: ['product', 'bidder'],
    });
    const updatedProduct = await productRepository.findOne({
      where: { id: product.id },
    });

    expect(savedBid).toBeTruthy();
    expect(savedBid?.bidAmount).toBe(payload.bidAmount);
    expect(savedBid?.product.id).toBe(product.id);
    expect(savedBid?.bidder.id).toBe(bidder.id);
    expect(updatedProduct?.currentPrice).toBe(payload.bidAmount);
  });
});
