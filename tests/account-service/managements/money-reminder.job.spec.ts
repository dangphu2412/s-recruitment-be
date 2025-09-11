import { Test, TestingModule } from '@nestjs/testing';
import { subYears } from 'date-fns';
import { UserRepository } from '../../../src/account-service/management/repositories/user.repository';
import { MoneyReminderJob } from '../../../src/account-service/management/jobs/money-reminder.job';
import { FeatureFlagsService } from '../../../src/system/feature-flags/feature-flags.service';
import { MessageQueueClient } from '../../../src/system/message-queue/message-queue.client';
import {
  MAIL_REMINDER_TOPIC,
  ReminderUserDTO,
} from '../../../src/account-service/management/dtos/core/reminder-user.dto';

describe('MoneyReminderJob', () => {
  let job: MoneyReminderJob;
  let userRepository: jest.Mocked<UserRepository>;
  let featureFlagsService: jest.Mocked<FeatureFlagsService>;
  let messageQueueClient: jest.Mocked<MessageQueueClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoneyReminderJob,
        {
          provide: UserRepository,
          useValue: { findReminderUsers: jest.fn() },
        },
        {
          provide: FeatureFlagsService,
          useValue: {
            ifOff: jest.fn(),
          },
        },
        {
          provide: MessageQueueClient,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    job = module.get(MoneyReminderJob);
    userRepository = module.get(UserRepository);
    featureFlagsService = module.get(FeatureFlagsService);
    messageQueueClient = module.get(MessageQueueClient);
  });

  describe('remindDebtMoney', () => {
    it('should skip if feature flag is OFF', async () => {
      // Arrange
      featureFlagsService.ifOff.mockReturnValue(true);

      // Act
      await job.remindDebtMoney();

      // Assert
      expect(userRepository.findReminderUsers).not.toHaveBeenCalled();
      expect(messageQueueClient.emit).not.toHaveBeenCalled();
    });

    it('should group users and emit reminders when flag is ON', async () => {
      // Arrange
      featureFlagsService.ifOff.mockReturnValue(false);

      const users: ReminderUserDTO[] = [
        {
          id: '1',
          email: 'a@test.com',
          joinedAt: new Date().toISOString(),
          debtMonths: 1,
        },
        {
          id: '2',
          email: 'b@test.com',
          joinedAt: new Date().toISOString(),
          debtMonths: 1,
        },
        {
          id: '3',
          email: 'c@test.com',
          joinedAt: new Date().toISOString(),
          debtMonths: 2,
        },
      ];
      userRepository.findReminderUsers.mockResolvedValue(users);

      // Act
      await job.remindDebtMoney();

      // Assert
      expect(userRepository.findReminderUsers).toHaveBeenCalled();
      expect(messageQueueClient.emit).toHaveBeenCalledTimes(2);

      expect(messageQueueClient.emit).toHaveBeenCalledWith(
        MAIL_REMINDER_TOPIC,
        {
          id: 1,
          debtMonths: 1,
          to: ['a@test.com', 'b@test.com'],
        },
      );
      expect(messageQueueClient.emit).toHaveBeenCalledWith(
        MAIL_REMINDER_TOPIC,
        {
          id: 2,
          debtMonths: 2,
          to: ['c@test.com'],
        },
      );
    });

    it('should log error when some emits fail', async () => {
      // Arrange
      featureFlagsService.ifOff.mockReturnValue(false);

      const users: ReminderUserDTO[] = [
        {
          id: '1',
          email: 'x@test.com',
          joinedAt: new Date().toISOString(),
          debtMonths: 1,
        },
      ];
      userRepository.findReminderUsers.mockResolvedValue(users);

      messageQueueClient.emit.mockImplementationOnce(() => {
        throw new Error('fail emit');
      });

      // Act
      expect(job.remindDebtMoney()).rejects.toBeInstanceOf(Error);

      // Assert
      expect(userRepository.findReminderUsers).toHaveBeenCalled();
    });
  });

  describe('removeOldMemberNotDebt', () => {
    it('should only keep users with joinedAt < 2 years ago when debtMonths = 0', async () => {
      // Arrange
      const recentUser: ReminderUserDTO = {
        id: '1',
        email: 'recent@test.com',
        joinedAt: new Date().toISOString(),
        debtMonths: 0,
      };

      const oldUser: ReminderUserDTO = {
        id: '2',
        email: 'old@test.com',
        joinedAt: subYears(new Date(), 3).toISOString(),
        debtMonths: 0,
      };
      userRepository.findReminderUsers.mockResolvedValue([oldUser, recentUser]);

      // Act
      await job.remindDebtMoney();

      // Assert
      expect(messageQueueClient.emit).toHaveBeenCalledWith('MAIL_REMINDER', {
        id: 0,
        debtMonths: 0,
        to: ['recent@test.com'],
      });
    });
  });
});
