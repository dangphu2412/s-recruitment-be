import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserRepository } from '../repositories/user.repository';
import {
  MAIL_SERVICE_TOKEN,
  MailService,
} from '../../../system/mail/mail.interface';
import { MonthlyReminderEmailTemplate } from './monthly-reminder-email';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReminderUserDTO } from '../dtos/core/reminder-user.dto';
import {
  FeatureFlagsService,
  FLAGS,
} from '../../../system/feature-flags/feature-flags.service';

@Injectable()
export class MoneyReminderJob {
  private readonly logger = new Logger(MoneyReminderJob.name);

  constructor(
    private userRepository: UserRepository,
    @Inject(MAIL_SERVICE_TOKEN)
    private mailService: MailService,
    private featureFlagsService: FeatureFlagsService,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async remindDebtMoney() {
    if (this.featureFlagsService.ifOff(FLAGS.ENABLE_V1_REMINDER_JOB)) {
      return;
    }

    this.logger.log('Starting reminder job');
    const users = await this.userRepository.findReminderUsers();

    const groupedUsersByDebtMonths = new Map<number, ReminderUserDTO[]>();

    users.forEach((user) => {
      if (!groupedUsersByDebtMonths.has(user.debtMonths)) {
        groupedUsersByDebtMonths.set(user.debtMonths, []);
      }

      groupedUsersByDebtMonths.get(user.debtMonths).push(user);
    });

    const results = await Promise.allSettled(
      Array.from(groupedUsersByDebtMonths.entries()).map(
        ([debtMonths, users]) => {
          return this.mailService.sendMail({
            to: (users as ReminderUserDTO[]).map((user) => user.email),
            subject: '[S-Group] NHẮC NHỞ TIỀN THÁNG',
            html: renderToStaticMarkup(
              MonthlyReminderEmailTemplate({
                missingMonths: parseInt(String(debtMonths)),
              }),
            ),
          });
        },
      ),
    );

    if (results.some((result) => result.status === 'rejected')) {
      this.logger.error(
        'Error while remind debt, please check: https://resend.com/emails',
      );
    }

    this.logger.log('Finished reminder job');
  }
}
