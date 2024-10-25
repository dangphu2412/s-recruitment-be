import {
  CreateUserGroupInput,
  GetUserGroupInputDto,
} from '../domain/inputs/user-group.input';
import { UserGroupsService } from '../domain/interfaces/user-groups.service';
import { Inject, Injectable } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { UserGroup } from '../domain/entities/user-group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  UserService,
  UserServiceToken,
} from '../domain/interfaces/user-service';
import { PageRequest } from '../../system/query-shape/dto';
import { Page } from '../../system/query-shape/dto';

@Injectable()
export class UserGroupsServiceImpl implements UserGroupsService {
  constructor(
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>,
    @Inject(UserServiceToken)
    private readonly userService: UserService,
  ) {}

  async createUserGroup(
    createUserGroupInput: CreateUserGroupInput,
  ): Promise<void> {
    const users = await this.userService.find(createUserGroupInput.userIds);

    // TODO: Check invalid userIds

    await this.userGroupRepository.save({
      ...createUserGroupInput,
      users,
    });
  }

  async findUserGroups(
    getUserGroupInputDto: GetUserGroupInputDto,
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
