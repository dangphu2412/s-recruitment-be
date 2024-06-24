import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Category } from '../domain/entities/category.entity';

@Injectable()
export class CategoryRepository extends Repository<Category> {
  constructor(
    @InjectRepository(Category)
    repository: Repository<Category>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }
}
