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
} from '@nestjs/common';
import {
  ActivityRequestService,
  ActivityRequestServiceToken,
} from './domain/core/services/activity-request.service';
import { CreateActivityRequestRequest } from './domain/presentation/dtos/create-activity-request.request';
import { CanAccessBy } from '../account-service/adapters/decorators/can-access-by.decorator';
import { Permissions } from '../account-service/domain/constants/role-def.enum';
import {
  CurrentUser,
  Identified,
} from '../account-service/adapters/decorators';
import { JwtPayload } from '../account-service/domain/dtos/jwt-payload';
import { UpdateApprovalActivityRequestRequest } from './domain/presentation/dtos/update-approval-activity-request.request';
import { UpdateMyActivityRequestRequest } from './domain/presentation/dtos/update-my-activity.request';
import { FindRequestedActivityRequestDTO } from './domain/presentation/dtos/find-requested-activity-request.dto';

@Controller('activities')
export class ActivityController {
  constructor(
    @Inject(ActivityRequestServiceToken)
    private readonly activityRequestService: ActivityRequestService,
  ) {}

  @CanAccessBy(Permissions.READ_ACTIVITIES)
  @Get('requests')
  findRequestedActivities(@Query() query: FindRequestedActivityRequestDTO) {
    return this.activityRequestService.findRequestedActivities(query);
  }

  @Identified
  @Get('my-requests')
  findMyRequestedActivities(@CurrentUser() user: JwtPayload) {
    return this.activityRequestService.findMyRequestedActivities(user.sub);
  }

  @Identified
  @Get('my-requests/:id')
  findMyRequestedActivity(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.activityRequestService.findMyRequestedActivity(id, user.sub);
  }

  @CanAccessBy(Permissions.WRITE_ACTIVITIES)
  @Post('requests')
  createRequestedActivity(
    @Body() dto: CreateActivityRequestRequest,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.activityRequestService.createRequestActivity({
      ...dto,
      authorId: user.sub,
    });
  }

  @Identified
  @Patch('my-requests/:id')
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
  @Patch('requests/:id')
  updateApprovalRequestedActivity(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApprovalActivityRequestRequest,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.activityRequestService.updateApprovalRequestActivity({
      id,
      ...dto,
      authorId: user.sub,
    });
  }
}
