import { DBService } from '@/common/modules/db/db.service';
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Web3Service } from '@/common/modules/web3/web3.service';
import { MirrorNodeDelayJob } from './mirror-node-delay.types';
import { BlockchainService } from '@/modules/block-chain/blockchain.service';

@Processor(`${process.env.REDIS_QUEUES_PREFIX}-mirror-node-delay`)
export class MirrorNodeDelayConsumer {
  constructor(
    private readonly blockchainService: BlockchainService
  ) {}
  
  @Process()
  async process(job: Job<MirrorNodeDelayJob>) {
    try {
      switch (job.data.type) {
        case 'saveNftMarketDeal': {
          console.log(`QUEUE(${process.env.REDIS_QUEUES_PREFIX}-mirror-node-delay): saveNftMarketDeal call`);
          this.handleErrors(await this.blockchainService.saveNftMarketDeal(job.data.params));
          break;
        }
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  handleErrors<T>(result: T) {
    if (result instanceof Error) {
      throw result;
    }

    return result;
  }
}