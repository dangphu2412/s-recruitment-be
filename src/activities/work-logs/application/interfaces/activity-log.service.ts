export const ActivityLogService = Symbol('ActivityLogService');

export interface ActivityLogService {
  runUserLogComplianceCheck(): Promise<void>;
  downloadLateReportFile(): Promise<Buffer>;
}
