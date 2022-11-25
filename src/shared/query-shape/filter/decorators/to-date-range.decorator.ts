import { Transform, TransformFnParams } from 'class-transformer';
import { isString } from 'class-validator';
import { parse } from 'qs';
import isNil from 'lodash.isempty';
import { DateRange } from '../entities/date-range.query';

export function ToDateRange() {
  return Transform((params: TransformFnParams) => {
    if (isNil(params.value) || !isString(params.value)) {
      return undefined;
    }

    const { fromDate, toDate } = parse(params.value);

    const dateRange = new DateRange();

    dateRange.fromDate = isString(fromDate) ? new Date(fromDate) : undefined;
    dateRange.toDate = isString(toDate) ? new Date(toDate) : undefined;

    return dateRange;
  });
}
