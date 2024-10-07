import { NftCollectionMetadata } from '@/common/modules/blockchain-data/blockchain-data.types';
import { hexToUtf8 } from '@/utils/encoding';
import { Injectable } from '@nestjs/common';
import { NftMetadata } from '@/common/services/graphql/graphql.types';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class IpfsService {
  private readonly IpfsGateway: string;

  constructor(private readonly httpService: HttpService) {
    this.IpfsGateway = process.env.IPFS_GATEWAY;
  }

  private async getFromIpfs(ipfsUrl: string) {
    if (!ipfsUrl.includes('ipfs://')) return null;

    ipfsUrl = ipfsUrl.replace('ipfs://', '');
    const {data} = await firstValueFrom(this.httpService.get(`${this.IpfsGateway}/${ipfsUrl}`));

    return data;
  }

  async populateNftMetadata(ipfsMetadataLink: string, isHex: boolean = false): Promise<NftMetadata | string> {
    if (isHex) {
      ipfsMetadataLink = hexToUtf8(ipfsMetadataLink);
    }

    const metadata = await this.getFromIpfs(ipfsMetadataLink);

    if (!metadata) {
      return ipfsMetadataLink;
    }

    if (!metadata.image) {
      return metadata;
    }

    const imageCID = metadata.image.replace('ipfs://', '');
    const imageHttpUrl = `${this.IpfsGateway}/${imageCID}`;

    metadata.image = imageHttpUrl;
    
    return metadata;
  }
}
