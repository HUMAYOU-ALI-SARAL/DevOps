import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeUsernameUnique1705570706230 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('ALTER TABLE "user" ADD CONSTRAINT "UQ_user_username" UNIQUE ("username")');
    }
  
    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('ALTER TABLE "user" DROP CONSTRAINT "UQ_user_username"');
    }
}
