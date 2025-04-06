import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ActivityRequestService,
  ActivityRequestServiceToken,
} from '../domain/core/services/activity-request.service';
import { CreateActivityRequestRequest } from '../domain/presentation/dtos/create-activity-request.request';
import { CanAccessBy } from '../../account-service/authorization/can-access-by.decorator';
import { Permissions } from '../../account-service/authorization/access-definition.constant';
import { CurrentUser } from '../../account-service/management/user.decorator';
import { JwtPayload } from '../../account-service/registration/jwt-payload';
import { UpdateApprovalActivityRequestRequest } from '../domain/presentation/dtos/update-approval-activity-request.request';
import { UpdateMyActivityRequestRequest } from '../domain/presentation/dtos/update-my-activity.request';
import { FindRequestedActivityRequestDTO } from '../domain/presentation/dtos/find-requested-activity-request.dto';
import { Identified } from '../../account-service/registration/identified.decorator';
import { FileInterceptor } from '../../system/file';
import { ApiConsumes } from '@nestjs/swagger';
import { FileActivityRequestDTO } from '../domain/core/dtos/file-create-activity-request.dto';

@Controller('activity-requests')
export class ActivityRequestController {
  constructor(
    @Inject(ActivityRequestServiceToken)
    private readonly activityRequestService: ActivityRequestService,
  ) {}

  @CanAccessBy(Permissions.WRITE_ACTIVITIES)
  @Get()
  findRequestedActivities(@Query() query: FindRequestedActivityRequestDTO) {
    return this.activityRequestService.findRequestedActivities(query);
  }

  @Identified
  @Get('my')
  findMyRequestedActivities(@CurrentUser() user: JwtPayload) {
    return this.activityRequestService.findMyRequestedActivities(user.sub);
  }

  @Identified
  @Get('my/:id')
  findMyRequestedActivity(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.activityRequestService.findMyRequestedActivity(id, user.sub);
  }

  @CanAccessBy(Permissions.READ_ACTIVITIES)
  @Post()
  createRequestedActivity(
    @Body() dto: CreateActivityRequestRequest,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.activityRequestService.createRequestActivity({
      ...dto,
      authorId: user.sub,
    });
  }

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  createActivityRequestByFile(
    @Body() dto: FileActivityRequestDTO,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.activityRequestService.createRequestActivityByFile({
      ...dto,
      file,
    });
  }

  @Identified
  @Patch('my/:id')
  updateRequestedActivity(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMyActivityRequestRequest,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.activityRequestService.updateMyRequestActivity({
      id,
      ...dto,
      authorId: user.sub,
    });
  }

  @CanAccessBy(Permissions.WRITE_ACTIVITIES)
  @Patch('approval-status')
  updateApprovalRequestedActivity(
    @Body() dto: UpdateApprovalActivityRequestRequest,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.activityRequestService.updateApprovalRequestActivity({
      ...dto,
      authorId: user.sub,
    });
  }
}
