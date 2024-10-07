import { PostNftMarketDealDTO } from "@/dtos/blockchain.dto";

export type MirrorNodeDelayJobParamsMap = {
  saveNftMarketDeal: PostNftMarketDealDTO
}

export type MirrorNodeDelayJob<
  Type extends keyof MirrorNodeDelayJobParamsMap = keyof MirrorNodeDelayJobParamsMap
> = {
  type: Type;
  params: MirrorNodeDelayJobParamsMap[Type]
}