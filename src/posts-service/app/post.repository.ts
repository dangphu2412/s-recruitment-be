import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Post } from '../domain/entities/posts.entity';

@Injectable()
export class PostRepository extends Repository<Post> {
  constructor(
    @InjectRepository(Post)
    repository: Repository<Post>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }
}
