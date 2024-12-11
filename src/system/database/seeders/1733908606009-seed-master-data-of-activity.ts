import { MigrationInterface, QueryRunner } from 'typeorm';
import { DayOfWeek } from '../../../activities/domain/data-access/day-of-week';
import { TimeOfDay } from '../../../activities/domain/data-access/time-of-day.entity';

export class SeedMasterDataOfActivity1733908606009
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const dayOfWeekRepository = queryRunner.manager.getRepository(DayOfWeek);
    const timeOfDayRepository = queryRunner.manager.getRepository(TimeOfDay);

    await dayOfWeekRepository.insert([
      { id: 'Mon', name: 'Mon' },
      { id: 'Tue', name: 'Tue' },
      { id: 'Wed', name: 'Wed' },
      { id: 'Thu', name: 'Thu' },
      { id: 'Fri', name: 'Fri' },
      { id: 'Sat', name: 'Sat' },
      { id: 'Sun', name: 'Sun' },
    ]);

    await timeOfDayRepository.insert([
      { id: 'SUM-MORN', name: 'Morning (8:30 - 11h30)' },
      { id: 'SUM-AFT', name: 'Afternoon (13:30 - 5h30)' },
      { id: 'SUM-EVN', name: 'Evening (7:00 - 9:30)' },
    ]);
  }

  public async down(): Promise<void> {
    return;
  }
}
