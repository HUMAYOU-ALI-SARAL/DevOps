import React, { useCallback, useEffect, useState } from 'react';
import Image, { StaticImageData } from "next/image";
import { useRouter } from 'next/router';
import { setIsLoading } from '@/reducers/blade.slice';
import { Nft, NftsRequest } from '@/types/blockchain.type';
import { useGetNftsMutation } from '@/api/blockchainApi';

interface SpotlightCardProps {
    tokenId:string;
    creatorImage1:string;
    creatorImage: StaticImageData;
    creatorName: string;
    collectionName: string;
    tags: { label: string; icon?: StaticImageData }[];
    buttonText: string;
    images: StaticImageData[];
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({ 
    tokenId,
    creatorImage1, 
    creatorImage, 
    creatorName, 
    collectionName, 
    tags, 
    buttonText, 
    images 
}) => {
    const router=useRouter()




    const [nfts, setNfts] = useState<Nft[]>([]);

    const [getNfts] = useGetNftsMutation();
    const fetchNfts = useCallback(() => {
        getNfts({
          pageSize: 8,
          tokenId:tokenId,
        })
          .unwrap()
          .then((response:any) => {
            const { nfts } = response;
            setNfts(nfts);
          })
          .catch((error:any) => {
            console.error("Failed to fetch NFTs:", error);
          });
      }, [tokenId]);

    useEffect(()=>{
        tokenId&&fetchNfts()
        console.log(nfts,"Nfts from spot")
},[tokenId])


    return (
        <div className="w-full grid grid-cols-12 gap-4 p-4 rounded-tl-xl rounded-bl-xl shadow-lg bg-[#282828]">
            <div className="col-span-6">
                <div className="flex flex-col items-start space-y-4">
                    <div className='flex items-center gap-2'>
                        <img src={creatorImage1?creatorImage1:creatorImage.src} alt={creatorName} className="w-20 h-[70px]" height={100} width={20}/>
                        <h2 className="text-[18px]">Creator: <br /> {creatorName}</h2>
                    </div>
                    <p className="text-md text-[#ADB1C2]">{collectionName}</p>
                    <div className="flex space-x-2">
                        {tags.map((tag, index) => (
                            <span 
                                key={index} 
                                className="rounded-lg px-4 py-1 border-[#ADB1C2] border-[1px] text-[#ADB1C2] text-[12px] flex items-center gap-2"
                            >
                                {tag.icon && <Image src={tag.icon} alt={tag.label} className="w-full h-auto" />}
                                {tag.label}
                            </span>
                        ))}
                    </div>
                    <button className="bg-[#EBECEF] text-[#0D0E13] rounded px-4 py-1 text-md" onClick={() => { router.push(`/allCollections`) }}>{buttonText}</button>
                </div>
            </div>
            <div className="col-span-6 grid grid-cols-12 gap-2">
                <div className="col-span-12 grid grid-cols-12 gap-2">
                    {nfts.length>0?(nfts.slice(0, 3).map((nft, index) => (
                        <div key={index} className="col-span-4">
                            <img src={nft.metadata.image} alt="Sphera Heads" className="w-full h-auto" />
                        </div>
                    ))):(images.slice(0, 3).map((image, index) => (
                        <div key={index} className="col-span-4">
                            <img src={image.src} alt="Sphera Heads" className="w-full h-auto" />
                        </div>
                    )))}
                </div>
                <div className="col-span-12 grid grid-cols-12 gap-2">
                {nfts.length>0?(nfts.slice(3, 6).map((nft, index) => (
                        <div key={index} className="col-span-4">
                            <img src={nft.metadata.image} alt="Sphera Heads" className="w-full h-auto" />
                        </div>
                    ))):(images.slice(0, 3).map((image, index) => (
                        <div key={index} className="col-span-4">
                            <img src={image.src} alt="Sphera Heads" className="w-full h-auto" />
                        </div>
                    )))}
                </div>
            </div>
        </div>
    );
};

export default SpotlightCard;
