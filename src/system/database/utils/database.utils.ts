export class DatabaseUtils {
  static createUniqueKey(tableName: string, columnName: string): string {
    return `UQ_${tableName}_${columnName}_key`;
  }

  /**
   *
   * @param time For example: 17:00 its from UTC+7
   */
  static formatTimeToUTC(time: string): string {
    const [hour, minute] = time.split(':');
    return `${parseInt(hour) - 7}:${minute}`;
  }
}
