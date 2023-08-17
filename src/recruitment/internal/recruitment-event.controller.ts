import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RecruitmentEventService } from './recruitment-event.service';
import { CreateRecruitmentEventDto } from '../client/dto/create-recruitment-event.dto';
import { UpdateRecruitmentDto } from '../client/dto/update-recruitment.dto';
import { CanAccessBy } from 'src/authorization/internal/decorators/can-access-by.decorator';
import { AccessRights } from 'src/authorization/internal/constants/role-def.enum';
import { CurrentUser } from 'src/authentication/internal/decorators';
import { JwtPayload } from 'src/authentication/client';

@Controller('recruitments/events')
export class RecruitmentEventController {
  constructor(
    private readonly recruitmentEventService: RecruitmentEventService,
  ) {}

  @CanAccessBy(AccessRights.MANAGE_RECRUITMENT)
  @Post()
  create(
    @Body() createRecruitmentDto: CreateRecruitmentEventDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.recruitmentEventService.create({
      ...createRecruitmentDto,
      authorId: user.sub,
    });
  }

  @Get()
  findAll() {
    return this.recruitmentEventService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recruitmentEventService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRecruitmentDto: UpdateRecruitmentDto,
  ) {
    return this.recruitmentEventService.update(+id, updateRecruitmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recruitmentEventService.remove(+id);
  }
}
