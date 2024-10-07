import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNftMarketDeal1706701009957 implements MigrationInterface {
    name = 'AddNftMarketDeal1706701009957'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft" DROP CONSTRAINT "FK_e87fc5e46f3594e32efdd149754"`);
        await queryRunner.query(`ALTER TABLE "nft" DROP CONSTRAINT "FK_c7d5371a1d144e49e39ac16c997"`);
        await queryRunner.query(`CREATE TABLE "nft_market_deal" ("id" SERIAL NOT NULL, "ownerId" character varying NOT NULL, "buyerId" character varying NOT NULL, "price" character varying NOT NULL, "transactionId" character varying NOT NULL, "consensusTimestamp" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "nftId" integer, CONSTRAINT "PK_23d7cd08bed345c21bd95cb2780" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "nft_market_deal" ADD CONSTRAINT "FK_7a96b0d3b68ea563c739aeb02c8" FOREIGN KEY ("nftId") REFERENCES "nft"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nft" ADD CONSTRAINT "FK_e87fc5e46f3594e32efdd149754" FOREIGN KEY ("metadataId") REFERENCES "nft_metadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nft" ADD CONSTRAINT "FK_c7d5371a1d144e49e39ac16c997" FOREIGN KEY ("marketListingId") REFERENCES "nft_market_listing"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft" DROP CONSTRAINT "FK_c7d5371a1d144e49e39ac16c997"`);
        await queryRunner.query(`ALTER TABLE "nft" DROP CONSTRAINT "FK_e87fc5e46f3594e32efdd149754"`);
        await queryRunner.query(`ALTER TABLE "nft_market_deal" DROP CONSTRAINT "FK_7a96b0d3b68ea563c739aeb02c8"`);
        await queryRunner.query(`DROP TABLE "nft_market_deal"`);
        await queryRunner.query(`ALTER TABLE "nft" ADD CONSTRAINT "FK_c7d5371a1d144e49e39ac16c997" FOREIGN KEY ("marketListingId") REFERENCES "nft_market_listing"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nft" ADD CONSTRAINT "FK_e87fc5e46f3594e32efdd149754" FOREIGN KEY ("metadataId") REFERENCES "nft_metadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
