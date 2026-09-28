import { PartialType } from '@nestjs/mapped-types';
import { CreateProductCategoryDto } from './CreateProductCategoryDto';

export class UpdateProductCategoryDto extends PartialType(CreateProductCategoryDto)
{ }
