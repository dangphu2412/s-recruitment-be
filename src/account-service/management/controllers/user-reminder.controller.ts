import { Controller, Logger, Post } from '@nestjs/common';
import { MoneyReminderJob } from '../jobs/money-reminder.job';
import { CanAccessBy } from '../../account-service.package';
import { Permissions } from '../../authorization/access-definition.constant';

@Controller({
  path: 'user-reminders',
})
export class UserReminderController {
  private readonly logger = new Logger(MoneyReminderJob.name);
  constructor(private readonly reminder: MoneyReminderJob) {}

  @CanAccessBy(Permissions.OWNER)
  @Post('monthly')
  remindMonthlyMoney() {
    this.logger.log(`Manually trigger reminder on ${new Date().toISOString()}`);
    return this.reminder.remindDebtMoney();
  }
}
