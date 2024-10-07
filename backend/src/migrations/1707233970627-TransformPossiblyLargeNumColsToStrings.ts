import { MigrationInterface, QueryRunner } from "typeorm";

export class TransformPossiblyLargeNumColsToStrings1707233970627 implements MigrationInterface {
    name = 'TransformPossiblyLargeNumColsToStrings1707233970627'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft_market_listing" DROP COLUMN "desired_price"`);
        await queryRunner.query(`ALTER TABLE "nft_market_listing" ADD "desired_price" character varying`);
        await queryRunner.query(`ALTER TABLE "nft" ALTER COLUMN "created_timestamp" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nft" ALTER COLUMN "account_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nft" ALTER COLUMN "token_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nft" DROP COLUMN "serial_number"`);
        await queryRunner.query(`ALTER TABLE "nft" ADD "serial_number" character varying`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "royalty_fee"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "royalty_fee" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "royalty_fee"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "royalty_fee" real`);
        await queryRunner.query(`ALTER TABLE "nft" DROP COLUMN "serial_number"`);
        await queryRunner.query(`ALTER TABLE "nft" ADD "serial_number" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nft" ALTER COLUMN "token_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nft" ALTER COLUMN "account_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nft" ALTER COLUMN "created_timestamp" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nft_market_listing" DROP COLUMN "desired_price"`);
        await queryRunner.query(`ALTER TABLE "nft_market_listing" ADD "desired_price" integer`);
    }

}
