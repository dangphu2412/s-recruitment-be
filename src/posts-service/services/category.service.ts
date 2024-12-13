import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';
import { CategoryService } from '../domain/core/services/category.service';

@Injectable()
export class CategoryServiceImpl implements CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async findAll() {
    return this.categoryRepository.find();
  }
}
