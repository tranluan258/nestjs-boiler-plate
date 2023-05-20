import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableForAuthorization1683437545777
  implements MigrationInterface
{
  name = 'CreateTableForAuthorization1683437545777';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "account" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdBy" 
      character varying, "updatedBy" character varying, "createdAt" TIMESTAMP DEFAULT 'now()', 
      "updatedAt" TIMESTAMP DEFAULT 'now()', "username" character varying(50) NOT NULL, 
      "password" character varying NOT NULL, CONSTRAINT "UQ_41dfcb70af895ddf9a53094515b" UNIQUE ("username"), 
      CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdBy" character varying, "updatedBy" character varying, "createdAt" TIMESTAMP DEFAULT 'now()', "updatedAt" TIMESTAMP DEFAULT 'now()', "name" character varying(40) NOT NULL, CONSTRAINT "UQ_ae4578dcaed5adff96595e61660" UNIQUE ("name"), CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "permission" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdBy" character varying, "updatedBy" character varying, "createdAt" TIMESTAMP DEFAULT 'now()', "updatedAt" TIMESTAMP DEFAULT 'now()', "resource" character varying NOT NULL, "action" character varying NOT NULL, CONSTRAINT "PK_3b8b97af9d9d8807e41e6f48362" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "policy" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdBy" character varying, "updatedBy" character varying, "createdAt" TIMESTAMP DEFAULT 'now()', "updatedAt" TIMESTAMP DEFAULT 'now()', "name" character varying NOT NULL, CONSTRAINT "UQ_5ad65e4ff971649343992959bd0" UNIQUE ("name"), CONSTRAINT "PK_9917b0c5e4286703cc656b1d39f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "account_role" ("accountId" uuid NOT NULL, "roleId" uuid NOT NULL, CONSTRAINT "PK_4a3b8866d6c58c548cbfd3bdb12" PRIMARY KEY ("accountId", "roleId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_28abfa0f6e6e035cecc6ad8df6" ON "account_role" ("accountId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0dfcf6e3c90abf44d4e4437a32" ON "account_role" ("roleId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "role_policy" ("roleId" uuid NOT NULL, "policyId" uuid NOT NULL, CONSTRAINT "PK_4f0311f5e67475eaaea9697a556" PRIMARY KEY ("roleId", "policyId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_30898f089b316e02ecce54e0f0" ON "role_policy" ("roleId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b5a15c5b7156b43c50c03e769f" ON "role_policy" ("policyId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "policy_permission" ("policyId" uuid NOT NULL, "permissionId" uuid NOT NULL, CONSTRAINT "PK_00115a0af766f8fe9bc1f9f5853" PRIMARY KEY ("policyId", "permissionId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c8b6335da8d361c1a1f12261b4" ON "policy_permission" ("policyId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e4ec31db59682bbafdd8801ff7" ON "policy_permission" ("permissionId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "account_role" ADD CONSTRAINT "FK_28abfa0f6e6e035cecc6ad8df6a" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_role" ADD CONSTRAINT "FK_0dfcf6e3c90abf44d4e4437a327" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_policy" ADD CONSTRAINT "FK_30898f089b316e02ecce54e0f01" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_policy" ADD CONSTRAINT "FK_b5a15c5b7156b43c50c03e769fe" FOREIGN KEY ("policyId") REFERENCES "policy"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "policy_permission" ADD CONSTRAINT "FK_c8b6335da8d361c1a1f12261b4b" FOREIGN KEY ("policyId") REFERENCES "policy"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "policy_permission" ADD CONSTRAINT "FK_e4ec31db59682bbafdd8801ff7e" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "policy_permission" DROP CONSTRAINT "FK_e4ec31db59682bbafdd8801ff7e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "policy_permission" DROP CONSTRAINT "FK_c8b6335da8d361c1a1f12261b4b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_policy" DROP CONSTRAINT "FK_b5a15c5b7156b43c50c03e769fe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_policy" DROP CONSTRAINT "FK_30898f089b316e02ecce54e0f01"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_role" DROP CONSTRAINT "FK_0dfcf6e3c90abf44d4e4437a327"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_role" DROP CONSTRAINT "FK_28abfa0f6e6e035cecc6ad8df6a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e4ec31db59682bbafdd8801ff7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c8b6335da8d361c1a1f12261b4"`,
    );
    await queryRunner.query(`DROP TABLE "policy_permission"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b5a15c5b7156b43c50c03e769f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_30898f089b316e02ecce54e0f0"`,
    );
    await queryRunner.query(`DROP TABLE "role_policy"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0dfcf6e3c90abf44d4e4437a32"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_28abfa0f6e6e035cecc6ad8df6"`,
    );
    await queryRunner.query(`DROP TABLE "account_role"`);
    await queryRunner.query(`DROP TABLE "policy"`);
    await queryRunner.query(`DROP TABLE "permission"`);
    await queryRunner.query(`DROP TABLE "role"`);
    await queryRunner.query(`DROP TABLE "account"`);
  }
}
