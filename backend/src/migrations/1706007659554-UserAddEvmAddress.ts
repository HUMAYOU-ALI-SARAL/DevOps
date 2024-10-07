import { MigrationInterface, QueryRunner } from "typeorm";

export class UserAddEvmAddress1706007659554 implements MigrationInterface {
    name = 'UserAddEvmAddress1706007659554'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "evm_address" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "evm_address"`);
    }

}
