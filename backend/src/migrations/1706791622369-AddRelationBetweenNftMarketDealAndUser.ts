import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRelationBetweenNftMarketDealAndUser1706791622369 implements MigrationInterface {
    name = 'AddRelationBetweenNftMarketDealAndUser1706791622369'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft_market_deal" DROP COLUMN "ownerId"`);
        await queryRunner.query(`ALTER TABLE "nft_market_deal" ADD "ownerId" integer`);
        await queryRunner.query(`ALTER TABLE "nft_market_deal" DROP COLUMN "buyerId"`);
        await queryRunner.query(`ALTER TABLE "nft_market_deal" ADD "buyerId" integer`);
        await queryRunner.query(`ALTER TABLE "nft_market_deal" ADD CONSTRAINT "FK_7612946a502770ced69b4ac9d16" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nft_market_deal" ADD CONSTRAINT "FK_243e8c6951ce6e0b266949f40fe" FOREIGN KEY ("buyerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft_market_deal" DROP CONSTRAINT "FK_243e8c6951ce6e0b266949f40fe"`);
        await queryRunner.query(`ALTER TABLE "nft_market_deal" DROP CONSTRAINT "FK_7612946a502770ced69b4ac9d16"`);
        await queryRunner.query(`ALTER TABLE "nft_market_deal" DROP COLUMN "buyerId"`);
        await queryRunner.query(`ALTER TABLE "nft_market_deal" ADD "buyerId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nft_market_deal" DROP COLUMN "ownerId"`);
        await queryRunner.query(`ALTER TABLE "nft_market_deal" ADD "ownerId" character varying NOT NULL`);
    }

}
