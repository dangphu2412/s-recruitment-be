import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
  TableUnique,
} from 'typeorm';

export class TableSetup1720749365859 implements MigrationInterface {
  private UNIQUE_USERNAME_KEY = 'UQ_users_username_key';
  private UNIQUE_EMAIL_KEY = 'UQ_users_email_key';
  private INDEX_USERNAME_KEY = 'IDX_users_username_key';
  private UNIQUE_ROLE_NAME_KEY = 'UQ_roles_name_key';
  private INDEX_USER_KEY = 'IDX_FK_users_roles_users_key';
  private INDEX_ROLE_KEY = 'IDX_FK_users_roles_roles_key';
  private FK_MENU_PARENT_KEY = 'FK_menus_parent_id_key';
  private UNIQUE_PERMISSION_NAME_KEY = 'UQ_permissions_name_key';
  private INDEX_MENU_SETTING_MENU_KEY = 'IDX_FK_menus_settings_menus_key';
  private INDEX_MENU_SETTING_PERMISSION_KEY =
    'IDX_FK_menus_settings_permissions_key';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            generationStrategy: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'username',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'full_name',
            type: 'varchar',
          },
          {
            name: 'tracking_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'phone_number',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
          },
          {
            name: 'password',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'birthday',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'joined_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createUniqueConstraints('users', [
      new TableUnique({
        name: this.UNIQUE_USERNAME_KEY,
        columnNames: ['username'],
      }),
      new TableUnique({
        name: this.UNIQUE_EMAIL_KEY,
        columnNames: ['email'],
      }),
    ]);

    await queryRunner.createIndices('users', [
      new TableIndex({
        name: this.INDEX_USERNAME_KEY,
        columnNames: ['username'],
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'roles',
        columns: [
          {
            name: 'id',
            type: 'int',
            generationStrategy: 'increment',
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'update_by_user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'is_editable',
            type: 'boolean',
            default: true,
          },
        ],
      }),
    );

    await queryRunner.createUniqueConstraints('roles', [
      new TableUnique({
        name: this.UNIQUE_ROLE_NAME_KEY,
        columnNames: ['name'],
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'users_roles',
        columns: [
          {
            name: 'id',
            type: 'int',
            generationStrategy: 'increment',
            isGenerated: true,
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'role_id',
            type: 'int',
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('users_roles', [
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onUpdate: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'roles',
        onUpdate: 'CASCADE',
      }),
    ]);

    await queryRunner.createIndices('users_roles', [
      new TableIndex({
        name: this.INDEX_USER_KEY,
        columnNames: ['user_id'],
      }),
      new TableIndex({
        name: this.INDEX_ROLE_KEY,
        columnNames: ['role_id'],
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'menus',
        columns: [
          {
            name: 'id',
            type: 'int',
            generationStrategy: 'increment',
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'code',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'icon_code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'access_link',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'mpath',
            type: 'varchar',
            default: "''",
            isNullable: false,
          },
          {
            name: 'parent_id',
            type: 'int',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'menus',
      new TableForeignKey({
        name: this.FK_MENU_PARENT_KEY,
        columnNames: ['parent_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'menus',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'monthly_money_configs',
        columns: [
          {
            name: 'id',
            type: 'int',
            generationStrategy: 'increment',
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: 'amount',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'month_range',
            type: 'smallint',
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'operation_fees',
        columns: [
          {
            name: 'id',
            type: 'int',
            generationStrategy: 'increment',
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: 'paid_money',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'remain_months',
            type: 'int',
            default: 0,
          },
          {
            name: 'paid_months',
            type: 'int',
            default: 0,
          },
          {
            name: 'temporary_leave_start',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'estimated_return_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'monthly_config_id',
            type: 'int',
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'operation_fee_id',
        type: 'int',
        isNullable: true,
      }),
    ]);

    await queryRunner.createForeignKeys('operation_fees', [
      new TableForeignKey({
        columnNames: ['monthly_config_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'monthly_money_configs',
      }),
    ]);

    await queryRunner.createForeignKeys('users', [
      new TableForeignKey({
        columnNames: ['operation_fee_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'operation_fees',
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'permissions',
        columns: [
          {
            name: 'id',
            type: 'int',
            generationStrategy: 'increment',
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createUniqueConstraints('permissions', [
      new TableUnique({
        name: this.UNIQUE_PERMISSION_NAME_KEY,
        columnNames: ['name'],
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'roles_permissions',
        columns: [
          {
            name: 'id',
            type: 'int',
            generationStrategy: 'increment',
            isGenerated: true,
          },
          {
            name: 'role_id',
            type: 'int',
          },
          {
            name: 'permission_id',
            type: 'int',
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('roles_permissions', [
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'roles',
      }),
      new TableForeignKey({
        columnNames: ['permission_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'permissions',
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'menu_settings',
        columns: [
          {
            name: 'id',
            type: 'int',
            generationStrategy: 'increment',
            isGenerated: true,
          },
          {
            name: 'permission_id',
            type: 'int',
          },
          {
            name: 'menu_id',
            type: 'int',
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('menu_settings', [
      new TableForeignKey({
        columnNames: ['menu_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'menus',
        onUpdate: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['permission_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'permissions',
        onUpdate: 'CASCADE',
      }),
    ]);

    await queryRunner.createIndices('menu_settings', [
      new TableIndex({
        name: this.INDEX_MENU_SETTING_PERMISSION_KEY,
        columnNames: ['permission_id'],
      }),
      new TableIndex({
        name: this.INDEX_MENU_SETTING_MENU_KEY,
        columnNames: ['menu_id'],
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'posts',
        columns: [
          {
            name: 'id',
            type: 'int',
            generationStrategy: 'increment',
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: 'slug',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'title',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'content',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'author_id',
            type: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('posts', [
      new TableForeignKey({
        columnNames: ['author_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
      }),
    ]);

    await queryRunner.addColumns('posts', [
      new TableColumn({
        name: 'preview_image',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'summary',
        type: 'varchar',
        isNullable: false,
        default: `''`,
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'categories',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'summary',
            type: 'varchar',
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'posts_categories',
        columns: [
          {
            name: 'id',
            type: 'int',
            generationStrategy: 'increment',
            isGenerated: true,
          },
          {
            name: 'post_id',
            type: 'int',
          },
          {
            name: 'category_id',
            type: 'varchar',
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('posts_categories', [
      new TableForeignKey({
        columnNames: ['post_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'posts',
      }),
      new TableForeignKey({
        columnNames: ['category_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'categories',
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'mdm_departments',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'mdm_periods',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'department_id',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'period_id',
        type: 'varchar',
        isNullable: true,
      }),
    ]);

    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        name: 'FK_users_department_id',
        columnNames: ['department_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'mdm_departments',
      }),
    );

    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        name: 'FK_users_period_id',
        columnNames: ['period_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'mdm_periods',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          {
            name: 'id',
            type: 'int',
            generationStrategy: 'increment',
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: 'amount',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'paid_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'note',
            type: 'varchar',
            default: "''",
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('payments', [
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'mdm_time_of_days',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'from_time',
            type: 'time without time zone',
            isNullable: false,
          },
          {
            name: 'to_time',
            type: 'time without time zone',
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'mdm_day_of_weeks',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'activity_requests',
        columns: [
          {
            name: 'id',
            type: 'int',
            generationStrategy: 'increment',
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: 'request_type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'reject_reason',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'revise_note',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'time_of_day_id',
            type: 'varchar',
          },
          {
            name: 'day_of_week_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'reason',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'compensatory_day',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'request_change_day',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'approval_status',
            type: 'varchar',
          },
          {
            name: 'author_id',
            type: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('activity_requests', [
      new TableForeignKey({
        columnNames: ['author_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
      }),
      new TableForeignKey({
        columnNames: ['time_of_day_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'mdm_time_of_days',
      }),
      new TableForeignKey({
        columnNames: ['day_of_week_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'mdm_day_of_weeks',
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'activities',
        columns: [
          {
            name: 'id',
            type: 'int',
            generationStrategy: 'increment',
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: 'request_type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'time_of_day_id',
            type: 'varchar',
          },
          {
            name: 'day_of_week_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'compensatory_day',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'request_change_day',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'author_id',
            type: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('activities', [
      new TableForeignKey({
        columnNames: ['author_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
      }),
      new TableForeignKey({
        columnNames: ['time_of_day_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'mdm_time_of_days',
      }),
      new TableForeignKey({
        columnNames: ['day_of_week_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'mdm_day_of_weeks',
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'activity_logs',
        columns: [
          {
            name: 'from_time',
            type: 'timestamp',
            isNullable: false,
            isPrimary: true,
          },
          {
            name: 'to_time',
            type: 'timestamp',
            isNullable: false,
            isPrimary: true,
          },
          {
            name: 'work_status',
            type: 'varchar',
          },
          {
            name: 'track_id',
            type: 'varchar',
            isNullable: false,
            isPrimary: true,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'device_user_logs',
        columns: [
          {
            name: 'device_user_id',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
          },
        ],
      }),
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
