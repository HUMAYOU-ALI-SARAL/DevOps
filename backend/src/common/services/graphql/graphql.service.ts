import { NftCollectionQueryResponse } from '@/common/modules/blockchain-data/blockchain-data.types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { GraphqlNftTransferHistory, NftQueryResponse, QueryBuildOptions } from './graphql.types';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { GetNftActivitiesDTO, GetTransactionsDTO } from '@/dtos/blockchain.dto';

@Injectable()
export class GraphqlService {
  private readonly graphqlEndpoint: string;
  private readonly graphqlApiKey: string;

  constructor(
    private readonly httpService: HttpService,
  ) {
    switch (process.env.NEXT_PUBLIC_HEDERA_NETWORK) {
      case 'mainnet':
        this.graphqlEndpoint = 'https://mainnet.hedera.api.hgraph.io/v1/graphql';
        break;
      case 'testnet':
        this.graphqlEndpoint = 'https://testnet.hedera.api.hgraph.io/v1/graphql'
        break;
    }

    this.graphqlApiKey = process.env.HGRAPH_GRAPHQL_API_KEY;
  }

  formatHederaIdForQuery(accountId: string) {
    return accountId.split('.').reverse?.()?.[0];
  }

  formatHederaIdFromNumber(accountId: number) {
    return `0.0.${accountId}`;
  }

  private async sendQuery(query: string) {
    try {
      const { data } = await firstValueFrom(this.httpService.request({
        baseURL: this.graphqlEndpoint,
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': this.graphqlApiKey,
        },
        data: { query },
      }));
  
      return data.data;
    } catch (err) {
      console.log('GraphQL request error:', err.message);
      return new NotFoundException('GraphQL request error.');
    }
  }

  async getAccountBalance(accountId: string) {
    accountId = this.formatHederaIdForQuery(accountId);

    const query = `{
      entity(where: {id: {_eq: ${accountId}}}) {
        balance,
      }
    }`;

    const {entity} = await this.sendQuery(query);
    const balance: string = entity?.[0]?.balance;

    return {
      balance: balance,
      error: balance === undefined 
        ? new NotFoundException(`Account Id ${accountId} Not Found`)
        : null,
    };
  }

  buildFilterQuery(...filters: string[]) {
    return filters.length
      ? `where: {
          ${filters.join('\n')}
        },`
      : '';
  }

  private buildNftsQuery({
    filterQuery,
    // orderBy,
    // orderDirection,
    page,
    pageSize,
  }: QueryBuildOptions) {
    return `{
      nft(
        ${filterQuery}
        limit: ${pageSize + 1},
        offset: ${(page - 1) * pageSize},
      ) {
        token_id,
        account_id,
        serial_number,
        metadata,
        created_timestamp,
        token {
          name,
          token_id,
          created_timestamp,
          total_supply,
          symbol,
          max_supply,
          custom_fee {
            royalty_fees,
            fixed_fees,
            fractional_fees,
          }
        },
      }
    }`
  }

  async queryNfts(options: QueryBuildOptions): Promise<NftQueryResponse> {
    const query = this.buildNftsQuery(options);

    return await this.sendQuery(query);
  }

  private buildNftsCollectionQuery({
    filterQuery,
    orderBy,
    orderDirection,
    page,
    pageSize,
  }: QueryBuildOptions) {
    return `{
      token(
        ${filterQuery}
        order_by: {${orderBy}: ${orderDirection}},
        limit: ${pageSize + 1},
        offset: ${(page - 1) * pageSize},
        distinct_on: ${orderBy}
      ) {
        token_id,
        treasury_account_id,
        name,
        symbol,
        created_timestamp,
        custom_fee {
          royalty_fees,
          fixed_fees,
        },
        entity {
          memo,
        },
        max_supply,
        total_supply,
      }
    }`;
  }

  async queryNftCollections(options: QueryBuildOptions): Promise<NftCollectionQueryResponse> {
    const query = this.buildNftsCollectionQuery(options);

    return await this.sendQuery(query);
  }

  private buildAccountEvmQuery(accountId: string) {
    return `
    {
      account: entity_by_pk(id: ${accountId}) {
        evm_address
      }
    }
    `;
  }

  async queryAccountEvm(accountId: string) {
    accountId = this.formatHederaIdForQuery(accountId);
    const query = this.buildAccountEvmQuery(accountId);

    return await this.sendQuery(query);
  }

  private buildNftTransferHistoryQuery(
    tokenId: string,
    serialNumber: number,
  ) {
    return `
    {
      nft_history: nft(
        where: {
          token_id: {_eq: ${tokenId}},
          serial_number: {_eq: ${serialNumber}}
        }, 
      ) {
        account_id,
        created_timestamp,
        history(
          order_by: { start_timestamp: desc },
          limit: 10,
        ) {
          account_id,
          start_timestamp,
          end_timestamp,
        },
      }
    }
    `;
  }

  async queryNftTransferHistory({tokenId, serialNumber}: GetNftActivitiesDTO): Promise<{nft_history: GraphqlNftTransferHistory[]}> {
    tokenId = this.formatHederaIdForQuery(tokenId);
    const query = this.buildNftTransferHistoryQuery(tokenId, serialNumber);

    return await this.sendQuery(query);
  }

  private buildTransactionsQuery({
    accountId,
    orderBy,
    orderDirection,
    page,
    pageSize
  }: GetTransactionsDTO) {
    accountId = this.formatHederaIdForQuery(accountId);

    return `
    {
      account: entity_by_pk(id: ${accountId}) {
        transactions: transfer(
          offset: ${(page - 1) * pageSize},
          limit: ${pageSize + 1},
          order_by: {${orderBy}: ${orderDirection}, transaction: {${orderBy}: ${orderDirection}}}
          distinct_on: ${orderBy}
        ) {
          amount
          transaction {
            payer_account_id
            result
            type
            id
            charged_tx_fee
            consensus_timestamp
            transfers: transfer {
              type
              sender_account_id
              receiver_account_id
              amount
              token {
                symbol
                decimals
                name
                token_id
              }
              nft {
                serial_number
              }
            }
          }
        }
      }
    }
    `;
  }

  async queryTransactions(getTransactionsDTO: GetTransactionsDTO) {
    const query = this.buildTransactionsQuery(getTransactionsDTO);

    return await this.sendQuery(query);
  }

  async queryEvmAddress(getTransactionsDTO: GetTransactionsDTO) {
    const query = this.buildTransactionsQuery(getTransactionsDTO);

    return await this.sendQuery(query);
  }
}
