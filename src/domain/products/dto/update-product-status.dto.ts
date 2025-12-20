import { IsEnum, IsNotEmpty } from 'class-validator';
import { ProductStatus } from '../entities/product.entity';

export class UpdateProductStatusDto {
  @IsNotEmpty()
  @IsEnum(ProductStatus)
  status: ProductStatus;
}
