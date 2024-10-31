import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiNoContentResponse } from '@nestjs/swagger';
import {
  CurrentUser,
  Identified,
} from 'src/account-service/adapters/decorators';
import { FileInterceptor } from 'src/system/file';
import { Page } from 'src/system/query-shape/dto';
import {
  CreateRecruitmentEventRequest,
  MarkEmployeeRequest,
} from './domain/presentation/dto';
import {
  RecruitmentEventService,
  RecruitmentEventServiceToken,
} from 'src/recruitment/domain/core/recruitment-event.service';
import { JwtPayload } from '../account-service/domain/dtos/jwt-payload';
import { FormBodyParserInterceptor } from '../system/form-body/form-body-parser.interceptor';
import { GetEventDetailRequest } from './domain/presentation/dto/get-event-detail.request';

@Identified
@Controller('recruitments/events')
export class RecruitmentEventController {
  constructor(
    @Inject(RecruitmentEventServiceToken)
    private readonly recruitmentEventService: RecruitmentEventService,
  ) {}

  @UseInterceptors(FileInterceptor('file'), FormBodyParserInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiNoContentResponse()
  @Post()
  create(
    @Body() createRecruitmentDto: CreateRecruitmentEventRequest,
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.recruitmentEventService.create({
      ...createRecruitmentDto,
      authorId: user.sub,
      file,
    });
  }

  @Get()
  async getAll() {
    const events = await this.recruitmentEventService.findAll();

    return Page.of({
      items: events,
      totalRecords: events.length,
      query: { size: 10, page: 1 },
    });
  }

  @Get(':id')
  getOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
    @Query() query: GetEventDetailRequest,
  ) {
    return this.recruitmentEventService.findOne({
      id: id,
      authorId: user.sub,
      ...query,
    });
  }

  @Post('/:eventId/mark')
  markPointForEmployee(
    @Body() markEmployeeDto: MarkEmployeeRequest,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.recruitmentEventService.markPointForEmployee({
      ...markEmployeeDto,
      authorId: user.sub,
    });
  }
}
