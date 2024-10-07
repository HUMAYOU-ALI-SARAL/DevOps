import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import R1 from '@/public/img/marketplace/Spotlight/s1.png';
import basketball from '@/public/img/marketplace/Spotlight/basketball.png';
import HB from '@/public/img/marketplace/Spotlight/Horizontal_Divider.png';
import { FaCirclePlus } from "react-icons/fa6";
import { setIsLoading } from '@/reducers/blade.slice';
import { Nft, NftsRequest } from '@/types/blockchain.type';
import { useGetNftsMutation } from '@/api/blockchainApi';
import { useRouter } from 'next/router';

const TabCard = ({
    width,
    height,
    showButton = true,
    imageWidth = 100,
    imageHeight = 100,
    textStyle = true,
    exploreText = false,
    collectionName,
    collectionImage,
    tokenId
}: {
    width?: number | string; 
    height?: number | string;
    showButton?: boolean;
    imageWidth?: number;
    imageHeight?: number;
    textStyle?: boolean;
    exploreText?: boolean;
    collectionName?:string;
    collectionImage?:string;
    tokenId?:string;
}) => {


    const [nfts, setNfts] = useState<Nft[]>([]);

    const [getNfts] = useGetNftsMutation();
    const fetchNfts = useCallback(
        (searchQuery?: string) => {
            setIsLoading(true);
            let query: NftsRequest = {
                pageSize: 16,
                searchQuery,
                tokenId:tokenId,
                //sidebarFilters,
            };
        
            getNfts(query)
                .unwrap()
                .then((response) => {
                    const {nfts } = response;
                    setNfts(nfts);
                })
                .catch((error) => {
                    console.log(error);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        },
        [tokenId]
    );


useEffect(()=>{
    fetchNfts()
},[tokenId])


const router=useRouter()

    return (
        <div
            className="bg-[#282828] text-white p-4 rounded-lg"
            style={{ height:'250px', width:'300px' }}
        >
            <div className='mt-[-12px]'>
                <Image src={HB} alt='' className='w-[100%]' />  
            </div>
            <div className="flex items-start justify-between mb-4 w-[100%]">
                <div className="flex items-center ">
                    <img src={collectionImage?collectionImage:R1.src} alt="Profile" className="rounded-lg h-[50px] max-w-[50px] overflow-hidden object-cover" />
                    <div className="ml-3 flex flex-col gap-4">
                        {
                            textStyle && (
                                <p className="font-bold text-lg">{collectionName?collectionName:"Slamdunk dynasty"}</p>
                            )
                        }
                        {
                            exploreText && (
                                <span className="font-thin text-md flex h-[30px] w-[150px] mt-1">{collectionName}</span>
                            )
                        }
                        {showButton && (
                            <div className="w-[100px] rounded-lg px-3 py-1 border-[#ADB1C2] border-[1px] text-[#ADB1C2] text-[12px] flex items-center gap-2">
                                <Image src={basketball} alt='' width={20} height={20} />
                                Basketball
                            </div>
                        )}
                    </div>
                </div>
                <div className='mt-2'>
                    <FaCirclePlus onClick={() => { router.push(`/collection/${tokenId}?tab=overview`) }} />
                </div>
            </div>
            <div>
                <Image src={HB} alt='' className='w-[100%]' />
            </div>
            <div className="flex gap-2 overflow-auto scrollbar-hide h-[110px]">
                <div className='w-[100%] rounded-lg overflow-hidden'>
                    <img height={"110px"} src={collectionImage?nfts[0]?.metadata?.image:R1.src} alt="Image 1" className="h-[110px] w-[100%] object-cover rounded-lg" />
                </div>
                <div className='w-[100%] rounded-lg overflow-hidden'>
                    <img height={"110px"} src={nfts.length>0?nfts[1]?.metadata?.image:R1.src} alt="Image 1" className="h-[110px]  w-[100%] object-cover rounded-lg" />
                </div>
                <div className='w-[100%] rounded-lg overflow-hidden'>
                    <img height={"110px"} src={nfts.length>0?nfts[2]?.metadata?.image:R1.src} alt="Image 1" className="h-[110px]  w-[100%] object-cover rounded-lg" />
                </div>
            </div>
        </div>
    );
};

export default TabCard;
