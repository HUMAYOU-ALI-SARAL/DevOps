import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTokenToNft1706606241773 implements MigrationInterface {
    name = 'AddTokenToNft1706606241773'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft" ADD "tokenId" integer`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "max_supply"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "max_supply" character varying`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "total_supply"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "total_supply" character varying`);
        await queryRunner.query(`ALTER TABLE "nft" ADD CONSTRAINT "FK_fab00ba947584a1eb04e9c70552" FOREIGN KEY ("tokenId") REFERENCES "nft_collection"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft" DROP CONSTRAINT "FK_fab00ba947584a1eb04e9c70552"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "total_supply"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "total_supply" integer`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "max_supply"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "max_supply" integer`);
        await queryRunner.query(`ALTER TABLE "nft" DROP COLUMN "tokenId"`);
    }

}
