import { MigrationInterface, QueryRunner } from 'typeorm';
import { MonthlyMoneyConfig } from '../../monthly-money';

export class SeedMonthlyMoneyConfig1667039519002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.insert(MonthlyMoneyConfig, [
      {
        amount: 150_000,
        monthRange: 24,
      },
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.delete(MonthlyMoneyConfig, {
      amount: 150_000,
      monthRange: 24,
    });
  }
}
