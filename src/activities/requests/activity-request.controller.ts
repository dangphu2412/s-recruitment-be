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
} from './interfaces/activity-request.service';
import { CreateActivityRequestRequest } from './dtos/presentation/create-activity-request.request';
import { CanAccessBy } from '../../account-service/authorization/can-access-by.decorator';
import { Permissions } from '../../account-service/authorization/access-definition.constant';
import { CurrentUser } from '../../account-service/management/user.decorator';
import { JwtPayload } from '../../account-service/registration/jwt-payload';
import { UpdateApprovalActivityRequestRequest } from './dtos/presentation/update-approval-activity-request.request';
import { UpdateMyActivityRequestRequest } from './dtos/presentation/update-my-activity.request';
import { FindRequestedActivityRequestDTO } from './dtos/presentation/find-requested-activity-request.dto';
import { Identified } from '../../account-service/registration/identified.decorator';
import { FileInterceptor } from '../../system/file';
import { ApiConsumes } from '@nestjs/swagger';
import { FileActivityRequestDTO } from './dtos/core/file-create-activity-request.dto';
import { UploadRequestActivityFileValidatorPipe } from './upload-activity-request-file.pipe';
import { FindMyRequestedActivitiesRequest } from './dtos/presentation/find-my-requested-activities.request';

@Controller('activity-requests')
export class ActivityRequestController {
  constructor(
    @Inject(ActivityRequestServiceToken)
    private readonly activityRequestService: ActivityRequestService,
  ) {}

  @CanAccessBy(Permissions.READ_ACTIVITY_REQUESTS)
  @Get()
  findRequestedActivities(@Query() query: FindRequestedActivityRequestDTO) {
    return this.activityRequestService.findRequestedActivities(query);
  }

  @CanAccessBy(Permissions.READ_MY_ACTIVITY_REQUESTS)
  @Identified
  @Get('my')
  findMyRequestedActivities(
    @CurrentUser() user: JwtPayload,
    @Query() query: FindMyRequestedActivitiesRequest,
  ) {
    return this.activityRequestService.findMyRequestedActivities({
      userId: user.sub,
      ...query,
    });
  }

  @Identified
  @CanAccessBy(Permissions.READ_MY_ACTIVITY_REQUESTS)
  @Get('my/:id')
  findMyRequestedActivity(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.activityRequestService.findMyRequestedActivity(id, user.sub);
  }

  @CanAccessBy(Permissions.WRITE_MY_ACTIVITY_REQUESTS)
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

  @CanAccessBy(Permissions.WRITE_ACTIVITY_REQUESTS)
  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  createActivityRequestByFile(
    @Body() dto: FileActivityRequestDTO,
    @UploadedFile(new UploadRequestActivityFileValidatorPipe())
    file: Express.Multer.File,
  ) {
    return this.activityRequestService.createRequestActivityByFile({
      ...dto,
      file,
    });
  }

  @CanAccessBy(Permissions.WRITE_MY_ACTIVITY_REQUESTS)
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
