import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcryptjs';

const defaultPassword = bcrypt.hashSync('123456', 10);

export class InitialAdminRole1683437869932 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "permission" ("action", "resource") VALUES ('manage', 'account')`,
    );
    await queryRunner.query(
      `INSERT INTO "permission" ("action", "resource") VALUES ('manage', 'role')`,
    );

    await queryRunner.query(
      `INSERT INTO "permission" ("action", "resource") VALUES ('manage', 'policy')`,
    );

    await queryRunner.query(
      `INSERT INTO "permission" ("action", "resource") VALUES ('manage', 'permission')`,
    );

    await queryRunner.query(
      `INSERT INTO "policy" ("name") VALUES ('PermissionFullAccess')`,
    );

    await queryRunner.query(
      `INSERT INTO "policy" ("name") VALUES ('PolicyFullAccess')`,
    );

    await queryRunner.query(
      `INSERT INTO "policy" ("name") VALUES ('RoleFullAccess')`,
    );

    await queryRunner.query(
      `INSERT INTO "policy" ("name") VALUES ('AccountFullAccess')`,
    );

    await queryRunner.query(
      `INSERT INTO "policy_permission" ("policyId", "permissionId") VALUES ((SELECT id FROM policy WHERE name = 'PermissionFullAccess'), (SELECT id FROM permission WHERE resource = 'permission' AND action = 'manage'))`,
    );

    await queryRunner.query(
      `INSERT INTO "policy_permission" ("policyId", "permissionId") VALUES ((SELECT id FROM "policy" WHERE name = 'PolicyFullAccess'), (SELECT id FROM "permission" WHERE resource = 'policy' AND action = 'manage'))`,
    );

    await queryRunner.query(
      `INSERT INTO "policy_permission" ("policyId", "permissionId") VALUES ((SELECT id FROM "policy" WHERE name = 'RoleFullAccess'), (SELECT id FROM "permission" WHERE resource = 'role' AND action = 'manage'))`,
    );

    await queryRunner.query(
      `INSERT INTO "policy_permission" ("policyId", "permissionId") VALUES ((SELECT id FROM "policy" WHERE name = 'AccountFullAccess'), (SELECT id FROM "permission" WHERE resource = 'account' AND action = 'manage'))`,
    );

    await queryRunner.query(`INSERT INTO "role" ("name") VALUES ('Admin')`);

    await queryRunner.query(
      `INSERT INTO "role_policy" ("roleId", "policyId") VALUES ((SELECT id FROM "role" WHERE name = 'Admin'), (SELECT id FROM "policy" WHERE name = 'PermissionFullAccess'))`,
    );

    await queryRunner.query(
      `INSERT INTO "role_policy" ("roleId", "policyId") VALUES ((SELECT id FROM "role" WHERE name = 'Admin'), (SELECT id FROM "policy" WHERE name = 'PolicyFullAccess'))`,
    );

    await queryRunner.query(
      ` INSERT INTO "role_policy" ("roleId", "policyId") VALUES ((SELECT id FROM "role" WHERE name = 'Admin'), (SELECT id FROM "policy" WHERE name = 'RoleFullAccess'))`,
    );

    await queryRunner.query(
      `INSERT INTO "role_policy" ("roleId", "policyId") VALUES ((SELECT id FROM "role" WHERE name = 'Admin'), (SELECT id FROM "policy" WHERE name = 'AccountFullAccess'))`,
    );

    await queryRunner.query(
      `INSERT INTO "account" ("username", "password") VALUES ('admin', '${defaultPassword}')`,
    );

    await queryRunner.query(
      `INSERT INTO "account_role" ("accountId", "roleId") VALUES ((SELECT id FROM "account" WHERE username = 'admin'), (SELECT id FROM "role" WHERE name = 'Admin'))`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
