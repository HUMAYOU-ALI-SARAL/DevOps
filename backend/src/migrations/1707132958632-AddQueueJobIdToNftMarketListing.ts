import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQueueJobIdToNftMarketListing1707132958632 implements MigrationInterface {
    name = 'AddQueueJobIdToNftMarketListing1707132958632'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft_market_listing" ADD "jobId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft_market_listing" DROP COLUMN "jobId"`);
    }

}
