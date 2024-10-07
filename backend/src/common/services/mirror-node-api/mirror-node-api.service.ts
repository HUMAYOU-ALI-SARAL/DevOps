import { Injectable } from '@nestjs/common';
import { MirrorApiAccountNfts, MirrorApiAccountTokens, MirrorApiTransactions } from './mirror-node-api.types';
import { GetNftAllowanceDTO, GetTokenAssociationDTO, GetTransactionsMirrorNodeDTO } from '@/dtos/blockchain.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ContractId } from '@hashgraph/sdk';

@Injectable()
export class MirrorNodeApiService {
  private readonly endpoint: string;
  private readonly marketContractId: ContractId;

  constructor(private readonly httpService: HttpService,) {
    switch (process.env.NEXT_PUBLIC_HEDERA_NETWORK) {
      case 'mainnet':
        this.endpoint = 'https://mainnet-public.mirrornode.hedera.com/api/v1';
        break;
      case 'testnet':
        this.endpoint = 'https://testnet.mirrornode.hedera.com/api/v1';
        break;
    }

    this.marketContractId = ContractId.fromString(process.env.NEXT_PUBLIC_MARKET_CONTRACT_ID!);
  }

  async getHbarPriceInUSD() {
    const { data } = await firstValueFrom(this.httpService.get(`${this.endpoint}/network/exchangerate`));
    const currentRate = data.current_rate;
    const hbarPriceInCents = currentRate.cent_equivalent / currentRate.hbar_equivalent;
    const USD_PRECISION = 10;
    const hbarPriceInUSD = (Math.round(hbarPriceInCents * Math.pow(10, USD_PRECISION)) / Math.pow(10, USD_PRECISION + 2));

    return hbarPriceInUSD as number;
  }

  async getTransactions({
    accountId,
    limit,
    order,
    timestamp
  }: GetTransactionsMirrorNodeDTO) {
    const queryParams = new URLSearchParams();
    
    queryParams.set('limit', limit.toString());
    queryParams.set('order', order);
    if (accountId !== null) queryParams.set('account.id', accountId);
    if (timestamp !== null) queryParams.set('timestamp', timestamp);

    const url = new URL(`${this.endpoint}/transactions`);
    url.search = queryParams.toString();

    const { data } = await firstValueFrom(this.httpService.get<MirrorApiTransactions>(url.href));

    return data;
  }

  async chechNftAllowance({
    ownerId,
    spenderId,
    tokenId,
    serialNumber,
  }: GetNftAllowanceDTO) {
    const queryParams = new URLSearchParams();
    
    queryParams.set('spender.id', spenderId);
    queryParams.set('token.id', tokenId);
    queryParams.set('serialnumber', String(serialNumber));

    const url = new URL(`${this.endpoint}/accounts/${ownerId}/nfts`);
    url.search = queryParams.toString();

    const { data } = await firstValueFrom(this.httpService.get<MirrorApiAccountNfts>(url.href));
    const hasAllowance = data.nfts.length > 0;

    return hasAllowance;
  }

  async chechTokenAssociation({
    accountId,
    tokenId,
  }: GetTokenAssociationDTO) {
    const queryParams = new URLSearchParams();
    
    queryParams.set('token.id', tokenId);

    const url = new URL(`${this.endpoint}/accounts/${accountId}/tokens`);
    url.search = queryParams.toString();

    const { data } = await firstValueFrom(this.httpService.get<MirrorApiAccountTokens>(url.href));
    const isAssociated = data.tokens.length > 0;

    return isAssociated;
  }

  async getTranasctionRecord(transactionId: string) {
    try {
      const [payerId, timestamp] = transactionId.split('@') ?? [null, null];
      const formattedTransactionId = `${payerId}-${timestamp.replaceAll('.', '-')}`;
      const url = new URL(`${this.endpoint}/contracts/results/${formattedTransactionId}`);
      const { data } = await firstValueFrom(this.httpService.get(url.href));

      return data;
    } catch (err) {
      // console.log(err);
      return err;
    }
  }
}
