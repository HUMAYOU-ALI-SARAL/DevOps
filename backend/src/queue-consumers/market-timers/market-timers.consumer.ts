import { DBService } from '@/common/modules/db/db.service';
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { MarketTimersJob } from './market-timers.types';
import { Web3Service } from '@/common/modules/web3/web3.service';
import { TokenId } from '@hashgraph/sdk';
import { BlockchainDataService } from '@/common/modules/blockchain-data/blockchain-data.service';

@Processor(`${process.env.REDIS_QUEUES_PREFIX}-market-timers`)
export class MarketTimersConsumer {
  constructor(
    private readonly dbService: DBService,
    private readonly web3Service: Web3Service,
  ) {}

  @Process()
  async process(job: Job<MarketTimersJob>) {
    const {
      tokenEvmAddress,
      serialNumber,
      buyerEvmAddress,
      type,
    } = job.data;

    try {
      switch (type) {
        case 'unlistNFT': {
          console.log(`QUEUE(${process.env.REDIS_QUEUES_PREFIX}-market-timers): 'unlistNFT' consumer call for ${tokenEvmAddress}/${serialNumber}.`);

          await this.web3Service.unlistNFT(tokenEvmAddress, serialNumber);

          const nft = await this.dbService.getNft({
            searchOptions: {
              token_id: TokenId.fromSolidityAddress(tokenEvmAddress).toString(),
              serial_number: String(serialNumber)
            },
            relations: {
              marketListing: true,
            }
          });
      
          if (!nft) {
            throw new Error('Nft not found');
          }
      
          nft.marketListing.is_listed = false;
          nft.marketListing.jobId = null;
      
          await this.dbService.updateNft(nft);
          break;
        }

        case 'deleteBid': {
          console.log(`QUEUE(${process.env.REDIS_QUEUES_PREFIX}-market-timers): 'deleteBid' consumer call for ${tokenEvmAddress}/${serialNumber}.`);

          await this.web3Service.deleteBid(
            tokenEvmAddress,
            serialNumber,
            buyerEvmAddress
          );
          break;
        }
      }
    } catch (err) {
       // stop attempts if there is a Market Contact Error.
       if (!err.status?._code) {
        throw err;
      }

      console.log(err);
    }
  }
}