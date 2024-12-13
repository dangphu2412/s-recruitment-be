import { registerDecorator, ValidationOptions, isEmpty } from 'class-validator';
import { SortQuery } from '../dto/sort.query';

export function IsSortQueryContains(
  allowFields: string[],
  validationOptions?: ValidationOptions,
) {
  return function (target: object, propertyKey: string) {
    registerDecorator({
      name: 'isSortQuery',
      target: target.constructor,
      propertyName: propertyKey,
      options: {
        message: 'sort fields are not acceptable',
        ...validationOptions,
      },
      validator: {
        validate(sortQuery: SortQuery<string>): boolean {
          return !isEmpty(sortQuery)
            ? Object.keys(sortQuery).every((sortField) =>
                allowFields.includes(sortField),
              )
            : false;
        },
      },
    });
  };
}
