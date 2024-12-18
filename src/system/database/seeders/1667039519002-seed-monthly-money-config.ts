import { MigrationInterface, QueryRunner } from 'typeorm';
import { MonthlyMoneyConfig } from '../../../monthly-money/domain/data-access/entities/monthly-money-config.entity';

export class SeedMonthlyMoneyConfig1667039519002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.insert(MonthlyMoneyConfig, [
      {
        amount: 200_000,
        monthRange: 24,
      },
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.delete(MonthlyMoneyConfig, {
      amount: 200_000,
      monthRange: 24,
    });
  }
}
