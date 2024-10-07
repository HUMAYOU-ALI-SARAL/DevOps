import React from 'react';
import Image from 'next/image';
import EsportImage from '@/public/img/marketplace/newCollections/ESPORT.png';
import { NftCollection } from "@/types/blockchain.type";

interface CollectionCardProps {
  width?: number | string;
  height?: number | string;
  collection?: NftCollection;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ width, height, collection }) => {
  return (
    <div className="rounded-lg overflow-hidden" style={{ width: width || "300px", height: "300px" }}>
      <div className="relative" style={{ width: width || "300px", height: height || "230px" }}>
        <Image
          alt="image"
          src={collection?.metadata?.image || EsportImage}
          layout="fill"
          objectFit="cover"
          className="object-cover w-full h-full"
        />
      </div>
      <div className="w-full bg-black text-white text-center h-[60px] pt-4 text-[13px] font-bold">
        <p>ESPORT ELITE ICONS</p>
      </div>
    </div>
  );
};

export default CollectionCard;
