import { useState, useEffect, useCallback } from 'react'
import Slider from "@/components/Slider/Slider";
import Fingerprint from '@/public/img/NewProfile/FingerPrint.png';
import ItemGrid from '../../ItemGrid/ItemGrid'
import { useGetNftsMutation } from "@/api/blockchainApi";
import NftItem from "@/components/Items/Nft/NftItem";
import { NFT_PAGE_LIMIT } from "@/constants/app.constants";
import { Nft, NftsRequest } from "@/types/blockchain.type";
import { UserProfileType } from "@/types/user.type";
import styles from '../../styles.module.scss'
import Image from 'next/image'

type Props = {
  userProfile: UserProfileType;
  isOwner?: boolean;
};


const MyCollections = ({ userProfile }: Props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [filter, setFilter] = useState<string>("");

  // APIs
  const [getNfts, getNftsStatus] = useGetNftsMutation();


  const fetchNfts = useCallback(
    (searchQuery?: string) => {
      setIsLoading(true);
      let query: NftsRequest = {
        accountId: userProfile?.accountId,
        pageSize: NFT_PAGE_LIMIT,
        searchQuery,
      };
      if (filter && filter === 'listed') {
        query = { ...query, isMarketListed: true };
      }
      getNfts(query)
        .unwrap()
        .then((response: any) => {
          const { isLastPage, nfts } = response;
          setNfts(nfts);
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [filter]
  );



  useEffect(() => {
    fetchNfts();
  }, []);


  return (
    <div className={`${styles.MyCollections}`}>
      <div className='mt-[-25px]'>
        <Slider />
      </div>
      <div className='py-12 px-14 '>
        <div className={`flex items-center justify-between `}>
          <div className='flex items-center gap-2'>
            <Image
              alt="banner"
              src={Fingerprint.src}
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "120px", maxHeight: "120px" }}
              quality={100}
            />
            <div>
              <p className='text-[24px] leading-none'>SPHERA <br /> PHYGITAL ID</p>
              <p className='text-[12px]'>BOND A PHYSICAL ITEM</p>
            </div>
          </div>
          <div className={`flex items-center justify-center gap-8 ${styles.Badges}`}>
            <img alt="image" className="w-[65px]" src="/img/achievements/logo-4.png" />
            <img alt="image" className="w-[65px]" src="/img/achievements/logo-1.png" />
            <img alt="image" className="w-[65px]" src="/img/achievements/logo-2.png" />
            <img alt="image" className="w-[65px]" src="/img/achievements/logo-3.png" />
            <img alt="image" className="w-[65px]" src="/img/achievements/logo-4.png" />
            <div className={`rounded-full p-6 text-[18px] font-bold text-[#a5a5a5]  ${styles.badgeCount}`}>+23</div>
          </div>
        </div>

        <div className='mt-12 flex items-center justify-between'>
          <div className='flex items-center gap-4 mt-12'>
            <div className='flex flex-col'>
              <p className="text-[30px] text-[#fff]">sPOINTS:</p>
              <p className="text-[30px] font-bold text-[#05EE54] mt-[-10px]" style={{ textShadow: "0px 0px 15px #05EE54" }}>475,673.35</p>
              <p className="text-[16px] text-[#999999] mt-[0px]">485$SPHERA</p>
              <div className={`text-[#999999] px-8 py-1 rounded-full mt-2 text-center ${styles.withDrawBalance}`}>CONVERT</div>
            </div>
            <div className={`py-4 px-8 rounded-[30px] min-h-[160px]  ${styles.withDrawBalance}`}>
              <p className='text-[16px] font-light'>Withdrawable balance</p>
              <p className='text-[30px] font-bold text-[#05EE54] mt-[0px] ' style={{ textShadow: "0px 0px 10px #05EE54" }}>4.5K <span className='text-[24px] font-bold text-[#fff]' style={{ textShadow: "none" }}>$SPHERA</span></p>
              <div className='flex items-between items-center gap-2 mt-2'>
                <p className='text-[#999999] text-[16px]'>350,439 SPT</p>
                <button className={`text-[#999999] font-bold p-2 px-4 rounded-full text-[14px] ${styles.withDrawBalance}`}>WITHDRAW</button>
              </div>
            </div>
          </div>

          <div className='mt-8'>
            <div className='flex items-center justify-between'>
              <p className='font-bold text-[#fff] text-[16px]'>HIGHLIGHTS</p>
              <p className='font-bold text-[#A4A4A4] text-[16px]'>VIEW ALL</p>
            </div>
            <div className='flex items-center gap-6 mt-2'>
              <div className={``}>
                <img
                  alt="image"
                  className="w-[140px]"
                  src="/img/NewProfile/Highlight.png"
                />
              </div>
              <div className={` ${styles.highlightCards}`}></div>
              <div className={` ${styles.highlightCards}`}></div>
              <div className={` ${styles.highlightCards}`}></div>
            </div>
          </div>
        </div>

        <ItemGrid nftItem={nfts}/>
      </div>
    </div>

  )
}

export default MyCollections