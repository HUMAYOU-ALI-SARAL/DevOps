import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { BlockchainModule } from './modules/block-chain/blockchain.module';
import typeorm from './config/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JsonBigintInterceptor } from '@/common/interceptors/json-bigint.interceptor';
import { BullModule } from '@nestjs/bull';
import { DBModule } from './common/modules/db/db.module';
import { Web3Module } from './common/modules/web3/web3.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'static'),
      serveRoot: '/',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm]
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => (configService.get('typeorm'))
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
      },
    }),
    DBModule,
    UserModule,
    BlockchainModule,
    Web3Module,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: JsonBigintInterceptor,
    },
  ],
})
export class AppModule {}