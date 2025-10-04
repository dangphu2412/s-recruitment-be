import { format, subMonths } from 'date-fns';
import { WorkTimeUtils } from '../application/work-status-evaluator.service';
import { FingerPrintLogViewDTO } from '../domain/view/finger-print-view.dto';

export class WorkLogExtractor {
  /**
   * Apply binary search to find logs from the previous year
   */
  static extractLogsFromLastHalfYear(
    logs: FingerPrintLogViewDTO[],
  ): FingerPrintLogViewDTO[] {
    const START_OF_PREVIOUS_YEAR = format(
      subMonths(new Date(), 6),
      'yyyy-MM-dd',
    );
    let left = 0;
    let right = logs.length - 1;
    let result = logs.length;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      if (
        WorkTimeUtils.formatDate(logs[mid].recordTime) >= START_OF_PREVIOUS_YEAR
      ) {
        result = mid;
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }

    return logs.slice(result);
  }
}
