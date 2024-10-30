import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CategoryService,
  CategoryServiceToken,
} from '../domain/core/services/category.service';

@ApiTags('categories')
@Controller({
  path: 'categories',
  version: '1',
})
export class CategoryController {
  constructor(
    @Inject(CategoryServiceToken)
    private readonly categoryService: CategoryService,
  ) {}

  @Get('/')
  getAll() {
    return this.categoryService.findAll();
  }
}
