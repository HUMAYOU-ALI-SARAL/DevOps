import { Body, Controller, Get, HttpException, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { BlockchainService } from '@/modules/block-chain/blockchain.service';
import { GetAccountEvmDTO, GetNFTsDTO, GetNftAllowanceDTO, GetNftMarketBidDTO, GetNftMarketBidsDTO, GetNftMarketItemInfoDTO, GetNftMarketAccountBidsDTO, GetTokenAssociationDTO, GetTransactionsDTO, PostNftMarketItemsDTO, PostNftMarketDealDTO, GetNftMarketPriceHistoryDTO, GetNftActivitiesDTO, NftActivitiesDTO } from '@/dtos/blockchain.dto';
import { ParseOptionalIntPipe } from '@/common/pipes/parse-int-optionally.pipe';
import { UserVerifiedGuard } from '@/common/guards/user-verified.guard';

@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockChainService: BlockchainService) {}

  @Get('balance/:accountId')
  async getAccountBalance(@Param('accountId') accountId: string) {
    const result = await this.blockChainService.getAccountBalance(accountId);

    if (result instanceof HttpException) {
      throw result;
    }

    return result;
  }

  @Get('nfts')
  async getNFTs(
    @Query('accountId') accountId?: string,
    @Query('serialNumber', ParseOptionalIntPipe) serialNumber?: number,
    @Query('tokenId') tokenId?: string,
    @Query('page', ParseOptionalIntPipe) page?: number,
    @Query('pageSize', ParseOptionalIntPipe) pageSize?: number,
    @Query('orderDirection') orderDirection?: 'asc' | 'desc',
    @Query('orderBy') orderBy?: string,
    @Query('nftCreator') nftCreator?: 'sphera_world',
    // DB only search
    @Query('searchQuery') searchQuery?: string,
    // DB only listed
    @Query('isMarketListed') isMarketListed?: boolean,
  ) {
    const result = await this.blockChainService.getNFTs(new GetNFTsDTO({
      accountId,
      tokenId,
      serialNumber,
      nftCreator,
      page,
      pageSize,
      orderDirection,
      orderBy,
      searchQuery,
      isMarketListed
    }));

    if (result instanceof HttpException) {
      throw result;
    }

    return result;
  }


  @Get('nfts/collections')
  async getNftCollections(
    @Query('nftCreator') nftCreator?: string,
    @Query('accountId') accountId?: string,
    @Query('tokenId') tokenId?: string,
    @Query('searchQuery') searchQuery?: string,
    @Query('page', ParseOptionalIntPipe) page?: number,
    @Query('pageSize', ParseOptionalIntPipe) pageSize?: number,
    @Query('orderDirection') orderDirection?: 'asc' | 'desc',
    @Query('orderBy') orderBy?: string,
  ) {
    const result = await this.blockChainService.getNftCollections(new GetNFTsDTO({
      accountId,
      tokenId,
      searchQuery,
      nftCreator,
      page,
      pageSize,
      orderDirection,
      orderBy
    }));

    if (result instanceof HttpException) {
      throw result;
    }

    return result;
  }

  @Get('nfts/activities')
  async getNftActivities(
    @Query('tokenId') tokenId: string,
    @Query('serialNumber', ParseIntPipe) serialNumber: number,
  ) {
    const nftActivities = await this.blockChainService.getNftActivities(new GetNftActivitiesDTO({
      tokenId,
      serialNumber
    }));

    if (nftActivities instanceof HttpException) {
      throw nftActivities;
    }

    return new NftActivitiesDTO(nftActivities);
  }

  @Get('transactions')
  async getTransactions(
    @Query('accountId') accountId?: string,
    @Query('page', ParseOptionalIntPipe) page?: number,
    @Query('pageSize', ParseOptionalIntPipe) pageSize?: number,
    @Query('orderDirection') orderDirection?: 'asc' | 'desc',
    @Query('orderBy') orderBy?: string,
  ) {
    const result = await this.blockChainService.getTransactions(new GetTransactionsDTO({
      accountId,
      page,
      pageSize,
      orderDirection,
      orderBy
    }));

    if (result instanceof HttpException) {
      throw result;
    }

    return result;
  }

  @Get('nfts/allowance')
  async checkNftAllowance(
    @Query('ownerId') ownerId: string,
    @Query('spenderId') spenderId: string,
    @Query('tokenId') tokenId: string,
    @Query('serialNumber', ParseIntPipe) serialNumber: number,
  ) {
    const result = await this.blockChainService.checkNftAllowance(new GetNftAllowanceDTO({
      ownerId,
      spenderId,
      tokenId,
      serialNumber
    }));

    if (result instanceof HttpException) {
      throw result;
    }

    return result;
  }

  @Get('tokens/association')
  async checkTokenAssociation(
    @Query('accountId') accountId: string,
    @Query('tokenId') tokenId: string,
  ) {
    const result = await this.blockChainService.checkTokenAssociation(new GetTokenAssociationDTO({
      accountId,
      tokenId,
    }));

    if (result instanceof HttpException) {
      throw result;
    }

    return result;
  }

  @Get('evm/:accountId')
  async getAccountEVM(
    @Param('accountId') accountId: string,
  ) {
    const result = await this.blockChainService.getAccountEVM(new GetAccountEvmDTO(accountId));

    if (result instanceof HttpException) {
      throw result;
    }

    return result;
  }

  @Get('nft-market/bids')
  async getNftMarketBids(
    @Query('tokenId') tokenId: string,
    @Query('serialNumber', ParseIntPipe) serialNumber: number,
    @Query('page', ParseOptionalIntPipe) page?: number,
    @Query('pageSize', ParseOptionalIntPipe) pageSize?: number,
  ) {
    const result = await this.blockChainService.getNftMarketBids(new GetNftMarketBidsDTO({
      tokenId,
      serialNumber,
      page,
      pageSize,
    }));

    if (result instanceof HttpException) {
      throw result;
    }

    return result;
  }

  @UseGuards(UserVerifiedGuard)
  @Post('nft-market/deals')
  async postNftMarketDeal(
    @Body() postNftMarketDealDto: PostNftMarketDealDTO,
  ) {
    const result = await this.blockChainService.queueNftMarketDeal(postNftMarketDealDto);

    if (result instanceof HttpException) {
      throw result;
    }

    return result;
  }

  @UseGuards(UserVerifiedGuard)
  @Get('nft-market/deals/price-history')
  async getNftMarketPriceHistory(
    @Query('tokenId') tokenId: string,
    @Query('serialNumber', ParseIntPipe) serialNumber: number,
    @Query('timestamp', ParseIntPipe) timestamp?: number,
  ) {
    const result = await this.blockChainService.getNftMarketPriceHistory(new GetNftMarketPriceHistoryDTO({
      serialNumber,
      timestamp,
      tokenId
    }));

    if (result instanceof HttpException) {
      throw result;
    }

    return result;
  }

  @Get('nft-market/bids/:accountId')
  async getNftMarketAccountBids(
    @Param('accountId') accountId: string,
    @Query('type') type?: 'received' | 'sent',
    @Query('page', ParseOptionalIntPipe) page?: number,
    @Query('pageSize', ParseOptionalIntPipe) pageSize?: number,
  ) {
    const result = await this.blockChainService.getNftMarketAccountBids(new GetNftMarketAccountBidsDTO({
      accountId,
      type,
      page,
      pageSize,
    }));

    if (result instanceof HttpException) {
      throw result;
    }

    return result;
  }

  @Get('nft-market/bid')
  async getNftMarketBid(
    @Query('tokenId') tokenId: string,
    @Query('serialNumber', ParseIntPipe) serialNumber: number,
    @Query('accountId') accountId: string,
  ) {
    const result = await this.blockChainService.getNftMarketBid(new GetNftMarketBidDTO({
      tokenId,
      serialNumber,
      accountId,
    }));

    if (result instanceof HttpException) {
      throw result;
    }

    return result;
  }

  @UseGuards(UserVerifiedGuard)
  @Post('nft-market/items')
  async postNftMarketList(
    @Body() postNftMarketItemsDto: PostNftMarketItemsDTO,
  ) {
    const result = await this.blockChainService.listOrUnlistMarketNFT(new PostNftMarketItemsDTO({...postNftMarketItemsDto}));

    if (result instanceof Error) {
      throw result;
    }

    return {message: 'Success'};
  }

  @Get('nft-market/listed-info')
  async getNftMarketItemInfo(
    @Query('tokenId') tokenId: string,
    @Query('serialNumber', ParseIntPipe) serialNumber: number,
  ) {
    const result = await this.blockChainService.getNftMarketItemInfo(new GetNftMarketItemInfoDTO({
      tokenId,
      serialNumber,
    }));

    if (result instanceof HttpException) {
      throw result;
    }

    return result;
  }
}
