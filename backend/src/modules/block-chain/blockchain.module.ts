import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { BlockchainController } from '@/modules/block-chain/blockchain.controller';
import { BlockchainService } from '@/modules/block-chain/blockchain.service';
import { DBModule } from '@/common/modules/db/db.module';
import { BlockchainDataModule } from '@/common/modules/blockchain-data/blockchain-data.module';
import { GetUserMiddleware } from '@/middlewares/optional-user.guard';
import { JwtService } from '@/common/services/jwt/jwt.service';
import { Web3Module } from '@/common/modules/web3/web3.module';
import { NodeCacheModule } from '@/common/modules/node-cache/node-cache.module';
import { BullModule } from '@nestjs/bull';
import { DBService } from '@/common/modules/db/db.service';
import { BlockchainDataService } from '@/common/modules/blockchain-data/blockchain-data.service';
import { Web3Service } from '@/common/modules/web3/web3.service';
import { MarketTimersConsumer } from '@/queue-consumers/market-timers/market-timers.consumer';
import { MirrorNodeDelayConsumer } from '@/queue-consumers/mirror-node-delay/mirror-node-delay.consumer';

@Module({
  imports: [
    DBModule,
    BlockchainDataModule,
    Web3Module,
    NodeCacheModule,
    BullModule.registerQueue(
      {
        name: `${process.env.REDIS_QUEUES_PREFIX}-market-timers`,
      },
      {
        name: `${process.env.REDIS_QUEUES_PREFIX}-mirror-node-delay`,
      },
    ),
  ],
  controllers: [BlockchainController],
  providers: [
    BlockchainService,
    JwtService,
    MarketTimersConsumer,
    MirrorNodeDelayConsumer
  ],
})
export class BlockchainModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
    .apply(GetUserMiddleware)
    .forRoutes({ path: 'blockchain/nfts', method: RequestMethod.GET });
  }
}
