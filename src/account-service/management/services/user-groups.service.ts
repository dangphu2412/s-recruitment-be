import { GetUserGroupRequest } from '../controllers/user-group.request';
import { UserGroupsService } from '../../domain/core/services/user-groups.service';
import { Inject, Injectable } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { UserGroup } from '../../domain/data-access/entities/user-group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  UserService,
  UserServiceToken,
} from '../../domain/core/services/user-service';
import { Page, PageRequest } from '../../../system/query-shape/dto';
import { CreateUserGroupDTO } from '../dtos/core/create-user-group.dto';

@Injectable()
export class UserGroupsServiceImpl implements UserGroupsService {
  constructor(
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>,
    @Inject(UserServiceToken)
    private readonly userService: UserService,
  ) {}

  async createUserGroup(dto: CreateUserGroupDTO): Promise<void> {
    const users = await this.userService.find(dto.userIds);

    // TODO: Check invalid userIds

    await this.userGroupRepository.save({
      ...dto,
      users,
    });
  }

  async findUserGroups(
    getUserGroupInputDto: GetUserGroupRequest,
  ): Promise<Page<UserGroup>> {
    const { offset, size } = PageRequest.of(getUserGroupInputDto);

    const groups = await this.userGroupRepository.find({
      take: size,
      skip: offset,
      ...(getUserGroupInputDto.search
        ? {
            where: {
              name: Like(getUserGroupInputDto.search),
            },
          }
        : {}),
      relations: ['users'],
    });

    return Page.of({
      items: groups,
      query: getUserGroupInputDto,
      totalRecords: groups.length,
    });
  }

  async deleteUserGroup(id: number): Promise<void> {
    await this.userGroupRepository.delete(id);
  }
}
