export class DatabaseNamingUtils {
  static createUniqueKey(tableName: string, columnName: string): string {
    return `UQ_${tableName}_${columnName}_key`;
  }
}
