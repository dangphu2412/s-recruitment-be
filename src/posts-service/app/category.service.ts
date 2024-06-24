import { Injectable } from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { CategoryService } from '../domain/services/category.service';

@Injectable()
export class CategoryServiceImpl implements CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async getAll() {
    return this.categoryRepository.find();
  }
}
