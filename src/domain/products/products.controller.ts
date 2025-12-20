import { Controller } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // TODO: 상품 CRUD + 경매 입찰 API 추가
}
