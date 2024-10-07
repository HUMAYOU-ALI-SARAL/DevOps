import React, { useEffect, useState } from 'react';
import SpotlightCard from './SpotlightCard';
import CreatorSpotlight from '@/public/img/marketplace/Spotlight/creator.png';
import S1 from '@/public/img/marketplace/Spotlight/s1.png';
import S2 from '@/public/img/marketplace/Spotlight/s2.png';
import S3 from '@/public/img/marketplace/Spotlight/s3.png';
import S4 from '@/public/img/marketplace/Spotlight/s4.png';
import S5 from '@/public/img/marketplace/Spotlight/s5.png';
import S6 from '@/public/img/marketplace/Spotlight/s6.png';

import S7 from '@/public/img/marketplace/Spotlight/s7.png';
import S8 from '@/public/img/marketplace/Spotlight/s8.png';
import S9 from '@/public/img/marketplace/Spotlight/s9.png';
import S10 from '@/public/img/marketplace/Spotlight/s10.png';
import S11 from '@/public/img/marketplace/Spotlight/s11.png';
import S12 from '@/public/img/marketplace/Spotlight/s12.png';

import art from '@/public/img/marketplace/Spotlight/art.png';
import { NftCollection } from '@/types/blockchain.type';
import { useGetCollectionsMutation } from '@/api/blockchainApi';
import { setIsLoading } from '@/reducers/blade.slice';

const Spotlight = () => {
    const [collections, setCollections] = useState<NftCollection[]>([]);
    const [getCollections, getCollectionsStatus] = useGetCollectionsMutation();
  
    const fetchCollections = () => {
      getCollections({}).unwrap()
        .then((response) => {
          const { collections } = response;
          console.log("collections", collections)
          setCollections(collections);
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    };
  
    useEffect(() => {
        fetchCollections()
    }, [])

    // console.log(collections[0].token_id,"this is tokenId from spot")
    // console.log(collections[1].token_id,"this is tokenId from spot")

    const cardData1 = {
        creatorImage1:collections[0]?.metadata?.image || "",
        creatorImage: CreatorSpotlight,
        creatorName:collections[0]?.name|| "Sphera World",
        collectionName:"Sphera Heads",
        tokenId:collections[0]?.token_id||"",
        tags: [
            { label: "PFP" },
            { label: "Utility" },
            { label: "Art", icon: art }
        ],
        buttonText: "View Collection",
        images: [S1, S2, S3, S4, S5, S6]
    };

    const cardData2 = {
        creatorImage1:collections[1]?.metadata?.image || "",
        creatorImage: CreatorSpotlight,
        creatorName:collections[1]?.name|| "Sphera World",
        collectionName:"Sphera Heads",
        tokenId:collections[1]?.token_id||"",
        tags: [
            { label: "PFP" },
            { label: "Utility" },
            { label: "Art", icon: art }
        ],
        buttonText: "View Collection",
        images: [S1, S2, S3, S4, S5, S6]
  };
    console.log(collections,"Collection fromSpit")
    return (
        <div className='max-w-[100%]'>
            <p className='text-[18px] mb-4'>Spotlight</p>
            <div className='w-full flex justify-between items-center gap-4'>
                <SpotlightCard {...cardData1} />
                <SpotlightCard {...cardData2} />
            </div>
        </div>
    );
};

export default Spotlight;
