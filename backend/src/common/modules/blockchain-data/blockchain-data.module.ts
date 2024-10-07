import { Module } from '@nestjs/common';
import { BlockchainDataService } from '@/common/modules/blockchain-data/blockchain-data.service';
import { IpfsService } from '@/common/services/ipfs/ipfs.service';
import { GraphqlService } from '@/common/services/graphql/graphql.service';
import { MirrorNodeApiService } from '@/common/services/mirror-node-api/mirror-node-api.service';
import { DBModule } from '@/common/modules/db/db.module';
import { HttpModule } from '@nestjs/axios';
import JSONBigInt from 'json-bigint';
import { Web3Module } from '../web3/web3.module';

const JSONbigNative = JSONBigInt({
  useNativeBigInt: true,
  storeAsString: true,
});

@Module({
  imports: [
    DBModule,
    Web3Module,
    HttpModule.register({
      // preventing the response the default behaviour of parsing the response with JSON.parse
      transformResponse: [data => {
        if (typeof data === 'string') {
          try {
            data = JSONbigNative.parse(data);
          } catch (e) { /* Ignore */ } // Added this Ignore as it's the same in the Axios
        }
        return data;
      }],
    }),
  ],
  providers: [
    BlockchainDataService,
    IpfsService,
    GraphqlService,
    MirrorNodeApiService,
  ],
  exports: [BlockchainDataService],
})
export class BlockchainDataModule {}
