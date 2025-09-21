import { Test, TestingModule } from '@nestjs/testing';
import { UserReminderController } from '../../../src/account-service/management/controllers/user-reminder.controller';
import { MoneyReminderJob } from '../../../src/account-service/management/jobs/money-reminder.job';

describe('UserReminderController', () => {
  let controller: UserReminderController;
  let reminderJob: MoneyReminderJob;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserReminderController],
      providers: [
        {
          provide: MoneyReminderJob,
          useValue: {
            remindDebtMoney: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(UserReminderController);
    reminderJob = module.get(MoneyReminderJob);

    // silence logger in tests
    jest.spyOn(controller['logger'], 'log').mockImplementation(() => {});
  });

  describe('remindMonthlyMoney', () => {
    it('should call reminder.remindDebtMoney and return result', async () => {
      // Arrange
      jest.spyOn(reminderJob, 'remindDebtMoney').mockResolvedValue(undefined);

      // Act
      const result = await controller.remindMonthlyMoney();

      // Assert
      expect(reminderJob.remindDebtMoney).toHaveBeenCalled();
      expect(result).toBe(undefined);
    });
  });
});
