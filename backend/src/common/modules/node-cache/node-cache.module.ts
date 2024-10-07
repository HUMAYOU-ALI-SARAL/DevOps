import { Module } from '@nestjs/common';
import { NodeCacheService } from './node-cache.service';

@Module({
  imports: [],
  providers: [NodeCacheService],
  exports: [NodeCacheService],
})
export class NodeCacheModule {}
