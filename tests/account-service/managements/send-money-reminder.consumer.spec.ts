import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';

import { renderToStaticMarkup } from 'react-dom/server';
import { SendMoneyReminderConsumer } from '../../../src/account-service/management/jobs/send-money-reminder.consumer';
import {
  MAIL_SERVICE_TOKEN,
  MailService,
} from '../../../src/system/mail/mail.interface';
import { MonthlyReminderEmailTemplate } from '../../../src/account-service/management/jobs/monthly-reminder-email';
import { SendReminderMessage } from '../../../src/account-service/management/dtos/core/reminder-user.dto';

jest.mock('react-dom/server', () => ({
  renderToStaticMarkup: jest.fn(),
}));

jest.mock(
  '../../../src/account-service/management/jobs/monthly-reminder-email',
  () => ({
    MonthlyReminderEmailTemplate: jest.fn(),
  }),
);

describe('SendMoneyReminderConsumer', () => {
  let consumer: SendMoneyReminderConsumer;
  let mailService: jest.Mocked<MailService>;

  beforeEach(async () => {
    mailService = { sendMail: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendMoneyReminderConsumer,
        {
          provide: MAIL_SERVICE_TOKEN,
          useValue: mailService,
        },
      ],
    }).compile();

    consumer = module.get(SendMoneyReminderConsumer);

    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
    (renderToStaticMarkup as jest.Mock).mockReturnValue(
      '<div>Mocked Email</div>',
    );
    (MonthlyReminderEmailTemplate as jest.Mock).mockReturnValue(
      '<MockedTemplate />',
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call sendMail with rendered template', async () => {
    const message: SendReminderMessage = {
      id: 1,
      to: ['user@example.com'],
      debtMonths: 3,
    };

    await consumer.consume(message);

    expect(Logger.prototype.debug).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ['user@example.com'],
        debtMonths: 3,
        timestamp: expect.any(Number),
      }),
    );

    expect(MonthlyReminderEmailTemplate).toHaveBeenCalledWith({
      missingMonths: 3,
    });
    expect(renderToStaticMarkup).toHaveBeenCalledWith('<MockedTemplate />');

    expect(mailService.sendMail).toHaveBeenCalledWith({
      to: ['user@example.com'],
      subject: '[S-Group] NHẮC NHỞ TIỀN THÁNG',
      html: '<div>Mocked Email</div>',
    });
  });

  it('should handle debtMonths as string and still parse correctly', async () => {
    const message: SendReminderMessage = {
      id: 1,
      to: ['user2@example.com'],
      debtMonths: '5' as unknown as number, // simulate weird input
    };

    await consumer.consume(message);

    expect(MonthlyReminderEmailTemplate).toHaveBeenCalledWith({
      missingMonths: 5,
    });
  });
});
