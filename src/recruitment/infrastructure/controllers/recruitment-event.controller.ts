import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiNoContentResponse } from '@nestjs/swagger';
import {
  Identified,
  JwtPayload,
} from 'src/account-service/authentication/domain';
import { CurrentUser } from 'src/account-service/authentication/adapters/decorators';
import { FileInterceptor } from 'src/system/file';
import { Page } from 'src/system/query-shape/dto';
import {
  MarkEmployeeDto,
  ImportEmployeesDto,
  CreateRecruitmentEventDto,
} from '../external-dtos';
import {
  RecruitmentEventUseCase,
  RecruitmentEventUseCaseToken,
} from 'src/recruitment/app/interfaces/recruitment-event.usecase';

@Identified
@Controller('recruitments/events')
export class RecruitmentEventController {
  constructor(
    @Inject(RecruitmentEventUseCaseToken)
    private readonly recruitmentEventUseCase: RecruitmentEventUseCase,
  ) {}

  @Post()
  create(
    @Body() createRecruitmentDto: CreateRecruitmentEventDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.recruitmentEventUseCase.create({
      ...createRecruitmentDto,
      authorId: user.sub,
    });
  }

  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiNoContentResponse()
  @Post('employees')
  importRecruitmentEventEmployees(
    @Body()
    importEmployeesDto: ImportEmployeesDto,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.recruitmentEventUseCase.importEmployees({
      ...importEmployeesDto,
      file,
    });
  }

  @Get()
  async findAll() {
    const events = await this.recruitmentEventUseCase.findAll();

    return Page.of({
      items: events,
      totalRecords: events.length,
      query: { size: 10, page: 1 },
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.recruitmentEventUseCase.findOne(+id, user.sub);
  }

  @Post('/:eventId/mark')
  markPointForEmployee(
    @Body() markEmployeeDto: MarkEmployeeDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.recruitmentEventUseCase.markPointForEmployee({
      ...markEmployeeDto,
      authorId: user.sub,
    });
  }
}
