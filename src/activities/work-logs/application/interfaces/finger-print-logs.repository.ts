import {
  FingerPrintLogViewDTO,
  FingerPrintUserViewItemDTO,
} from '../../domain/view/finger-print-view.dto';

export const FingerPrintLogsRepository = Symbol('FingerPrintLogsRepository');
export interface FingerPrintLogsRepository {
  findLogsOfSixMonth(): Promise<FingerPrintLogViewDTO[]>;

  /**
   * TODO: Need refactor to separate these
   */
  findUsers(): Promise<FingerPrintUserViewItemDTO[]>;
}
