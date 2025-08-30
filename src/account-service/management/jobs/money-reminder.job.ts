import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserRepository } from '../repositories/user.repository';
import {
  MAIL_REMINDER_TOPIC,
  ReminderUserDTO,
  SendReminderMessage,
} from '../dtos/core/reminder-user.dto';
import {
  FeatureFlagsService,
  FLAGS,
} from '../../../system/feature-flags/feature-flags.service';
import { MessageQueueClient } from '../../../system/message-queue/message-queue.client';

@Injectable()
export class MoneyReminderJob {
  private readonly logger = new Logger(MoneyReminderJob.name);

  constructor(
    private userRepository: UserRepository,
    private featureFlagsService: FeatureFlagsService,
    private messageQueueClient: MessageQueueClient,
  ) {}

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_NOON)
  async remindDebtMoney() {
    if (this.featureFlagsService.ifOff(FLAGS.ENABLE_V1_REMINDER_JOB)) {
      return;
    }

    this.logger.log('Starting reminder job');

    const users = await this.userRepository.findReminderUsers();

    const groupedUsersByDebtMonths = new Map<number, ReminderUserDTO[]>();

    this.logger.debug('Grouping users by debt month');
    users.forEach((user) => {
      if (!groupedUsersByDebtMonths.has(user.debtMonths)) {
        groupedUsersByDebtMonths.set(user.debtMonths, []);
      }

      groupedUsersByDebtMonths.get(user.debtMonths).push(user);
    });

    const results = await Promise.allSettled(
      Array.from(groupedUsersByDebtMonths.entries()).map(
        ([debtMonths, users]) => {
          const to = (users as ReminderUserDTO[]).map((user) => user.email);
          this.logger.debug({ message: `Emitting ${debtMonths}`, to });

          this.messageQueueClient.emit<SendReminderMessage>(
            MAIL_REMINDER_TOPIC,
            {
              id: debtMonths,
              debtMonths,
              to,
            },
          );
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
