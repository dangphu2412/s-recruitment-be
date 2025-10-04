import { ActivityLog } from 'src/system/database/entities/activity-log.entity';
import { OffsetPaginationResponse } from '../../../../system/pagination';
import { FindLogQueryDTO } from '../dtos/find-log-query.dto';

export const ActivityLogService = Symbol('ActivityLogService');

export interface ActivityLogService {
  findLogs(
    findLogQueryDTO: FindLogQueryDTO,
  ): Promise<OffsetPaginationResponse<ActivityLog>>;
  runUserLogComplianceCheck(): Promise<void>;
  downloadLateReportFile(): Promise<Buffer>;
}
