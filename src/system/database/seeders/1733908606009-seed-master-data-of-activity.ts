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
      { id: '0', name: 'Sun' },
      { id: '1', name: 'Mon' },
      { id: '2', name: 'Tue' },
      { id: '3', name: 'Wed' },
      { id: '4', name: 'Thu' },
      { id: '5', name: 'Fri' },
      { id: '6', name: 'Sat' },
    ]);

    await timeOfDayRepository.insert([
      {
        id: 'SUM-MORN',
        name: 'Morning (8:30 - 11h30)',
        fromTime: '8:30',
        toTime: '11:30',
      },
      {
        id: 'SUM-AFT',
        name: 'Afternoon (13:30 - 17h30)',
        fromTime: '13:30',
        toTime: '17:30',
      },
      {
        id: 'SUM-EVN',
        name: 'Evening (19:00 - 21:30)',
        fromTime: '19:00',
        toTime: '21:30',
      },
    ]);
  }

  public async down(): Promise<void> {
    return;
  }
}
