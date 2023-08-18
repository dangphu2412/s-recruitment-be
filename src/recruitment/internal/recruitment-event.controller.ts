import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiNoContentResponse } from '@nestjs/swagger';
import { JwtPayload } from 'src/authentication/client';
import { CurrentUser } from 'src/authentication/internal/decorators';
import { AccessRights } from 'src/authorization/internal/constants/role-def.enum';
import { CanAccessBy } from 'src/authorization/internal/decorators/can-access-by.decorator';
import { FileInterceptor } from '../../system/internal';
import { CreateRecruitmentEventDto } from '../client/dto/create-recruitment-event.dto';
import { ImportEmployeesDto } from '../client/dto/import-employees.dto';
import { RecruitmentEventService } from './recruitment-event.service';

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

  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiNoContentResponse()
  @Post('employees')
  importRecruitmentEventEmployees(
    importEmployeesDto: ImportEmployeesDto,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.recruitmentEventService.importEmployees({
      ...importEmployeesDto,
      file,
    });
  }

  @Get()
  findAll() {
    return this.recruitmentEventService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recruitmentEventService.findOne(id);
  }
}
