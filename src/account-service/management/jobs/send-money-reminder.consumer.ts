import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  MAIL_SERVICE_TOKEN,
  MailService,
} from '../../../system/mail/mail.interface';
import {
  MAIL_REMINDER_TOPIC,
  SendReminderMessage,
} from '../dtos/core/reminder-user.dto';
import { renderToStaticMarkup } from 'react-dom/server';
import { MonthlyReminderEmailTemplate } from './monthly-reminder-email';
import { Topic } from '../../../system/message-queue/topic-explorer';
import { MessageConsumer } from '../../../system/message-queue/message-consumer';

@Injectable()
@Topic(MAIL_REMINDER_TOPIC, {
  // Each 3 second process 1 send mail - due to resend rps: 2/s ref: https://resend.com/docs/knowledge-base/resend-sending-limits?utm_source=chatgpt.com#rate-limits
  rate: 3000,
})
export class SendMoneyReminderConsumer
  implements MessageConsumer<SendReminderMessage>
{
  private readonly logger = new Logger(SendMoneyReminderConsumer.name);

  constructor(
    @Inject(MAIL_SERVICE_TOKEN)
    private readonly mailService: MailService,
  ) {}

  async consume({ to, debtMonths }: SendReminderMessage): Promise<void> {
    this.logger.debug({ to, debtMonths, timestamp: Date.now() });

    await this.mailService.sendMail({
      to,
      subject: '[S-Group] NHẮC NHỞ TIỀN THÁNG',
      html: renderToStaticMarkup(
        MonthlyReminderEmailTemplate({
          missingMonths: parseInt(String(debtMonths)),
        }),
      ),
    });
  }
}
