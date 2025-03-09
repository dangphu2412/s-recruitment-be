import { Controller, Get } from '@nestjs/common';
import trackedUsers from './data/users.json';
import { Page } from '../system/query-shape/dto';

@Controller('activity-mdm')
export class ActivityMdmController {
  @Get('tracked-users')
  findTrackedUsers() {
    return Page.of({
      query: {
        page: 1,
        size: trackedUsers.data.length,
      },
      items: trackedUsers.data,
      totalRecords: trackedUsers.data.length,
    });
  }
}
