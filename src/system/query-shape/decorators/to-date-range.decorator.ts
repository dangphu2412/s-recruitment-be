import { Transform, TransformFnParams } from 'class-transformer';
import { isString } from 'class-validator';
import isNil from 'lodash.isempty';
import { DateRange } from '../dto/date-range.query';

export function ToDateRange() {
  return Transform((params: TransformFnParams) => {
    if (isNil(params.value) || !isString(params.value)) {
      return undefined;
    }

    try {
      const { fromDate, toDate } = JSON.parse(params.value);

      const dateRange = new DateRange();

      dateRange.fromDate = fromDate;
      dateRange.toDate = toDate;

      return dateRange;
    } catch {
      return undefined;
    }
  });
}
