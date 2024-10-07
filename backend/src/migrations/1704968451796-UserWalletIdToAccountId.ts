import { MigrationInterface, QueryRunner } from "typeorm"

export class UserWalletIdToAccountId1704968451796 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
            ALTER TABLE "user"
            RENAME COLUMN "wallet_id" TO "account_id"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
            ALTER TABLE "user"
            RENAME COLUMN "account_id" TO "wallet_id"
        `);
    }

}
