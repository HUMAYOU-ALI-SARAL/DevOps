import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNftCaching1706279765870 implements MigrationInterface {
    name = 'AddNftCaching1706279765870'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "nft_attribute" ("id" SERIAL NOT NULL, "trait_type" character varying NOT NULL, "value" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "nftMetadataId" integer, CONSTRAINT "PK_e0cb689a52118afb56c43a48f81" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "nft_metadata" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "image" character varying NOT NULL, "type" character varying NOT NULL, "description" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, CONSTRAINT "PK_c36d2ea36d7de5e265c30b8be80" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "nft_market_listing" ("id" SERIAL NOT NULL, "is_listed" boolean, "desired_price" integer, "listing_end_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, CONSTRAINT "PK_9edaaba08e0649647822e7824ed" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "nft" ("id" SERIAL NOT NULL, "created_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "account_id" character varying NOT NULL, "token_id" character varying NOT NULL, "serial_number" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "metadataId" integer, "marketListingId" integer, CONSTRAINT "REL_e87fc5e46f3594e32efdd14975" UNIQUE ("metadataId"), CONSTRAINT "REL_c7d5371a1d144e49e39ac16c99" UNIQUE ("marketListingId"), CONSTRAINT "PK_8f46897c58e23b0e7bf6c8e56b0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "name" character varying`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "max_supply" integer`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "total_supply" integer`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "royalty_fee" real`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "royalty_fee_collector" character varying`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "created_timestamp" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "symbol" character varying`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ALTER COLUMN "token_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP CONSTRAINT "UQ_f8f30499894bfabf2feba79e687"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`);
        await queryRunner.query(`ALTER TABLE "user_link" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "user_link" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`);
        await queryRunner.query(`ALTER TABLE "user_link" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "user_link" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`);
        await queryRunner.query(`ALTER TABLE "nft_attribute" ADD CONSTRAINT "FK_10248fff1e6d9c9f7ee7be55ad1" FOREIGN KEY ("nftMetadataId") REFERENCES "nft_metadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nft" ADD CONSTRAINT "FK_e87fc5e46f3594e32efdd149754" FOREIGN KEY ("metadataId") REFERENCES "nft_metadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nft" ADD CONSTRAINT "FK_c7d5371a1d144e49e39ac16c997" FOREIGN KEY ("marketListingId") REFERENCES "nft_market_listing"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft" DROP CONSTRAINT "FK_c7d5371a1d144e49e39ac16c997"`);
        await queryRunner.query(`ALTER TABLE "nft" DROP CONSTRAINT "FK_e87fc5e46f3594e32efdd149754"`);
        await queryRunner.query(`ALTER TABLE "nft_attribute" DROP CONSTRAINT "FK_10248fff1e6d9c9f7ee7be55ad1"`);
        await queryRunner.query(`ALTER TABLE "user_link" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "user_link" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`);
        await queryRunner.query(`ALTER TABLE "user_link" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "user_link" ADD "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD CONSTRAINT "UQ_f8f30499894bfabf2feba79e687" UNIQUE ("token_id")`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ALTER COLUMN "token_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "symbol"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "created_timestamp"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "royalty_fee_collector"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "royalty_fee"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "total_supply"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "max_supply"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "name"`);
        await queryRunner.query(`DROP TABLE "nft"`);
        await queryRunner.query(`DROP TABLE "nft_market_listing"`);
        await queryRunner.query(`DROP TABLE "nft_metadata"`);
        await queryRunner.query(`DROP TABLE "nft_attribute"`);
    }

}
