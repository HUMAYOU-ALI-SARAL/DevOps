import { Injectable } from '@nestjs/common';
import Web3, { Contract } from 'web3';
import marketAbi from '@/common/modules/web3/market.abi.json';
import { AccountId, Client, ContractExecuteTransaction, ContractFunctionParameters, ContractId, Hbar, PrivateKey, TokenId, Transaction, TransactionId, TransactionRecordQuery } from '@hashgraph/sdk';
import { GetNftMarketItemInfoDTO, GetNftMarketBidsDTO } from '@/dtos/blockchain.dto';
import { NftMarketItemInfo, NftMarketBid } from './web3.types';

@Injectable()
export class Web3Service {
  private readonly marketContractId: ContractId;
  private readonly rpcRelayUrl: string;
  private readonly web3Provider: Web3;
  private readonly marketContract: Contract<any>;
  private readonly hederaClient: Client;

  private readonly contractCallGasFee: number = 1_000_000;
  private readonly maxTransactionFee: Hbar = new Hbar(10);

  constructor() {
    this.marketContractId = ContractId.fromString(process.env.NEXT_PUBLIC_MARKET_CONTRACT_ID);
    this.rpcRelayUrl = process.env.WEB3_RPC_RELAY;
    this.web3Provider = new Web3(new Web3.providers.HttpProvider(this.rpcRelayUrl));
    this.marketContract = new this.web3Provider.eth.Contract(marketAbi, this.marketContractId.toSolidityAddress());

    const operatorId = AccountId.fromString(process.env.CONTRACT_OWNER_ACCOUNT_ID!);
    const operatorKey = PrivateKey.fromStringDer(process.env.CONTRACT_OWNER_ACCOUNT_PRIV_KEY!);

    this.hederaClient = process.env.NEXT_PUBLIC_HEDERA_NETWORK === 'testnet'
      ? Client.forTestnet().setOperator(operatorId, operatorKey)
      : Client.forMainnet().setOperator(operatorId, operatorKey);
  }

  async getNftMarketBids({
    tokenId,
    serialNumber,
    page,
    pageSize
  }: GetNftMarketBidsDTO) {
    const result = await this.marketContract
      .methods
      .getTokenBids(
        TokenId.fromString(tokenId).toSolidityAddress(),
        serialNumber,
        page,
        pageSize,
      )
      .call();
    return result as NftMarketBid[];
  }

  async getNftMarketContractItemInfo({
    tokenId,
    serialNumber,
  }: GetNftMarketItemInfoDTO) {
    const nftId = `0x${TokenId.fromString(tokenId).toSolidityAddress()}/${serialNumber}`;

    const result: NftMarketItemInfo = await this.marketContract
      .methods
      .nfts(nftId)
      .call();
    return {
      ...result,
      owner: result.owner.toLowerCase(),
      token: result.token.toLowerCase(),
      listingEndTimestamp: null,
    } as NftMarketItemInfo;
  }

  async getNftMarketBid(
    tokenId: string,
    serialNumber: number,
    evmAddress: string,
  ) {
    const result = await this.marketContract
      .methods
      .getTokenBid(
        TokenId.fromString(tokenId).toSolidityAddress(),
        serialNumber,
        evmAddress
      )
      .call();
    return {...result} as NftMarketBid;
  }

  async getNftMarketReceivedBids(
    accountEvmAddress: string,
    page: number,
    pageSize: number,
  ) {
    const result = await this.marketContract
      .methods
      .getReceivedBids(
        accountEvmAddress,
        page,
        pageSize,
      )
      .call();
    return result as NftMarketBid[];
  }

  async getNftMarketSentBids(
    accountEvmAddress: string,
    page: number,
    pageSize: number,
  ) {
    const result = await this.marketContract
      .methods
      .getSentBids(
        accountEvmAddress,
        page,
        pageSize,
      )
      .call();
    return result as NftMarketBid[];
  }

  // Hedera
  private async executeTransaction(tx: Transaction) {
    const transactionId = TransactionId.generate(this.hederaClient.operatorAccountId);
    tx = tx.setTransactionId(transactionId);

    try {
      const response = await tx.execute(this.hederaClient);
      const rx = await response.getReceipt(this.hederaClient);

      return rx;
    } catch (err) {
      console.log(`Error TransactionId: ${transactionId.toString()}`);

      throw err;
    }
  }

  // QUERY FEE: $0.0001
  async getTransactionRecord(transactionId: string) {
    return await new TransactionRecordQuery()
      .setTransactionId(TransactionId.fromString(transactionId))
      .execute(this.hederaClient);
  }

  async decodeEvent(eventName: string, logData: string, topics: string | string[]) {
    try {
      const eventAbi = marketAbi.find((event) => event.name === eventName && event.type === "event");
      const decodedLog = this.web3Provider.eth.abi.decodeLog(eventAbi.inputs, logData, topics);
      return decodedLog;
    } catch (err) {
      return null;
    }
  }

  // CONTRACT CALL FEE: $0.05
  async deleteBid(
    tokenEvmAddress: string,
    serialNumber: number,
    buyerEvmAddress: string,
  ) {
    const tx = new ContractExecuteTransaction()
      .setContractId(this.marketContractId)
      .setGas(this.contractCallGasFee)
      .setMaxTransactionFee(this.maxTransactionFee)
      .setFunction(
        'deleteBid',
        new ContractFunctionParameters()
          .addAddress(tokenEvmAddress)
          .addUint256(serialNumber)
          .addAddress(buyerEvmAddress)
      );
    
    return this.executeTransaction(tx);
  }

  // CONTRACT CALL FEE: $0.05
  async unlistNFT(
    tokenEvmAddress: string,
    serialNumber: number,
  ) {
    const tx = new ContractExecuteTransaction()
      .setContractId(this.marketContractId)
      .setGas(this.contractCallGasFee)
      .setMaxTransactionFee(this.maxTransactionFee)
      .setFunction(
        'unlistNFT',
        new ContractFunctionParameters()
          .addAddress(tokenEvmAddress)
          .addUint256(serialNumber)
      );
    
    return this.executeTransaction(tx);
  }
}
