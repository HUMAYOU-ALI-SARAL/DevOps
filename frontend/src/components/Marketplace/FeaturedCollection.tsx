import React, { useCallback, useEffect, useState } from "react";
import { useGetCollectionsMutation, useGetNftsMutation } from "@/api/blockchainApi";
import Image from 'next/image';
import feature from '@/public/img/marketplace/feature/feature.png';
import hbr from '@/public/img/collection/spheraheads/hbr.png';
import { NftCollection, Nft } from "@/types/blockchain.type";
import { useBladeWallet } from "@/providers/blade-wallet.provider";
import Loader from '../../components/Common/Loader'
import { useRef } from 'react';;
import VolumeChange from "../../pages/allCollections/VolumeChange";
import { useRouter } from "next/router";
import collectionTag from '@/public/img/collection/spheraheads/Rectangle21.png'
import basket from '@/public/img/collection/spheraheads/basket.png'
import Moto from '@/public/img/collection/spheraheads/moto.png'
import MMA from '@/public/img/collection/spheraheads/mma.png'
import cric from '@/public/img/collection/spheraheads/crick.png'
import gaming from '@/public/img/collection/spheraheads/Gaming.png'
import Footbal from '@/public/img/collection/spheraheads/Footbal.png'
import Formula from '@/public/img/collection/spheraheads/formula.png'
import boxing from '@/public/img/collection/spheraheads/boxing.png'
import rally from '@/public/img/collection/spheraheads/rally.png'
import camel from '@/public/img/collection/spheraheads/cammel.png'
import FloorPrice from "../../pages/allCollections/FloorPrice";
import { IoLogoReact } from "react-icons/io5";
import { FaRing } from "react-icons/fa";
import { CiStar } from "react-icons/ci";
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import 'swiper/css';




const FeaturedCollection = () => {
  const router = useRouter()
  const { tinyBarToHbar } = useBladeWallet()
  const [isLoading, setIsLoading] = useState(true);
  const [collections, setCollections] = useState<NftCollection[]>([]);
  const [getCollections, getCollectionsStatus] = useGetCollectionsMutation();
  const [nfts, setNfts] = useState<Nft[]>([])
  const [getNfts] = useGetNftsMutation();
  const swiperRef: any = useRef(null);
  const Next = () => { if (swiperRef.current && swiperRef.current?.swiper) { swiperRef?.current?.swiper.slideNext() } }
  const Prev = () => { if (swiperRef.current && swiperRef.current?.swiper) { swiperRef?.current?.swiper.slidePrev() } }
  const [pageNo, setPageNo] = useState<any>(1);
  const [search,setSearch]=useState<string>("")
  const[filteredCollection,setFilteredCollections]=useState<NftCollection[]>(collections)
  const [floor, setFloor] = useState<any>();

  useEffect(() => {
    fetchCollections();
  }, []);
  useEffect(() => {
    fetchNfts()
  }, [pageNo]);


  const fetchCollections = () => {
    getCollections({}).unwrap()
      .then((response) => {
        const { collections } = response;
        console.log("collections", collections)
        setCollections(collections);
        setFilteredCollections(collections)
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  const fetchNfts = useCallback(() => {
    setIsLoading(true);
    getNfts({
      page: pageNo,
      pageSize: 10,
      orderDirection: 'desc',
      isMarketListed: true,
    })
      .unwrap()
      .then((response: any) => {
        const { nfts, isLastPage } = response;
        setNfts((prevNfts: any) => [...prevNfts, ...nfts]);
        !isLastPage ? setPageNo(pageNo + 1) : console.log(isLastPage, 'yes this is page');
      })
      .catch((error) => {
        console.error('Error fetching NFTs:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [pageNo]);
  
  const collectionHandler=(event:any)=>{
    setSearch(event.target.value)
    const fc =event.target.value!==""?collections.filter(item => ((item.name).toLocaleLowerCase().includes(search.toLocaleLowerCase()))):collections;
    fc&&setFilteredCollections(fc)
    
  }

  const owners = useCallback((tokenId: string) => {
    let x = 0;
    const fc = nfts.filter(item => item.token.token_id === tokenId);
    if (fc.length > 1) {
      // Eliminate duplicates
      const uniqueArray = [];
      const seenPrices = new Set();

      for (const item of fc) {
        if (!seenPrices.has(item?.owner?.accountId)) {
          uniqueArray.push(item);
          seenPrices.add(item.owner?.accountId);
          x++;
        }
      }
      // Calculate the percentage change
    }
    return x
  }, [nfts]);
  const filterCollection = useCallback((tokenId:any) => {
    const fc = nfts.filter((item) => item.token.token_id === tokenId);
  
    if (fc.length > 0) {
      // Sort the array
      const sortedArray = fc.sort((a, b) => Number(a.price) - Number(b.price));
  
      // Eliminate duplicates
      const uniqueArray = [];
      const seenPrices = new Set();
  
      for (const item of sortedArray) {
        if (!seenPrices.has(item.price)) {
          uniqueArray.push(item);
          seenPrices.add(item.price);
        }
      }
      console.log(uniqueArray)
      // Set the floor price
      return uniqueArray.length > 0 && uniqueArray[0].price
        ? tinyBarToHbar(BigInt(uniqueArray[0]?.price))
        : 0;
    }
    return tinyBarToHbar(BigInt(0));
  }, [nfts,pageNo]);
  const isListed=useCallback((tokenId:string)=>{
    const fc = nfts.filter(item => item.token.token_id === tokenId)
    return fc.length
  },[nfts,pageNo])

  const filterChange = useCallback((tokenId: string) => {
    const fc = nfts.filter(item => item.token.token_id === tokenId);
    if (fc.length > 1) {
      // Sort the array
      const sortedArray = fc.sort((a, b) => Number(a.price) - Number(b.price));

      // Eliminate duplicates
      const uniqueArray = [];
      const seenPrices = new Set();

      for (const item of sortedArray) {
        if (!seenPrices.has(item.price)) {
          uniqueArray.push(item);
          seenPrices.add(item.price);
        }
      }

      // Calculate the percentage change
      return uniqueArray.length > 1
        ? (((Number(uniqueArray[1].price) - Number(uniqueArray[0].price)) / Number(uniqueArray[0]?.price)) * 100).toFixed(2)
        : 0;
    }
    return tinyBarToHbar(BigInt(0));
  }, [nfts]);

  const volumeInPrice = useCallback((tokenId: string) => {
    const hbar = nfts.filter(item => item.token.token_id === tokenId).reduce((sum, item) => sum + Number(item.price), 0);
    const tinyhbar = hbar / 100000000
    return tinyBarToHbar(BigInt(hbar))
  }, [nfts, pageNo]);
  return (
    <>
      {(isLoading || getCollectionsStatus.isLoading) ? (
        <Loader />
      ) : (
        <div>
          <div className="w-full px-8 rounded-3xl" style={{ boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.8), 0 -2px 4px -2px rgba(0, 0, 0, 0.5)' }}>
            <div className="w-full py-12">
              <p className='text-[18px] text-[#838383] font-extrabold'>Featured Collection</p>
              <Image sizes="100vw" src={feature} alt="image" className='w-full h-[180px]' />
            </div>
            <div className='w-full flex flex-col justify-center items-center'>
              <div className='w-[88%] flex justify-between items-center my-2'>
                <div>
                  <p className='text-[12px] text-[#BFC4CA]'>TRENDING</p>
                </div>
                <div>
                  <div className='flex items-center gap-3'>
                    {/* <span className='text-[12px] text-[#BFC4CA]'>1h</span>
                    <span className='text-[12px] text-[#BFC4CA]'>24h</span>
                    <span className='text-[12px] text-[#BFC4CA]'>7d</span>
                    <span className='text-[12px]'><IoLogoReact /></span>
                    <span className='text-[12px]'><FaRing /></span> */}
                    <span>
                      <input
                        type="text"
                        className="min-w-[600px] bg-sp-gray h-7 border border-grar-800 placeholder-neutral-500 text-white text-[14px] rounded-md focus:ring-orange-hover focus:border-orange-hover p-1.5"
                        placeholder="Filter by collection"
                        onChange={collectionHandler}
                        value={search}
                      />
                    </span>
                    {/* <span className='text-[12px] text-[#BFC4CA]'>FILTERS</span>
                    <span className='text-[12px] text-[#BFC4CA]'>FAVORITES</span>
                    <span className='text-[12px] text-[#BFC4CA]'>INVENTORY</span> */}
                  </div>
                </div>
              </div>

              <div className='w-[90%] rounded-3xl overflow-hidden bg-[#282828]'>
                <table className="w-full text-left table-auto rounded-2xl">
                  <thead>
                    <tr className="bg-[#282828] text-[#BFC4CA]">
                      <th className="p-4 text-[12px] font-light">#</th>
                      <th className="py-4 text-[12px] font-light text-[#BFC4CA]">Collection</th>
                      <th className="py-4 text-[12px] font-light text-[#BFC4CA]">FLOOR PRICE</th>
                      <th className="py-4 text-[12px] font-light text-[#BFC4CA]">FLOOR CHANGE</th>
                      <th className="py-4 text-[12px] font-light">VOLUME</th>
                      <th className="py-4 text-[12px] font-light">VOLUME CHANGE</th>
                      <th className="py-4 text-[12px] font-light">ITEMS</th>
                      <th className="py-4 text-[12px] font-light">Owners</th>
                      <th className="py-4 text-[12px] font-light">Listed</th>
                    </tr>
                  </thead>
                  <tbody className="cursor-pointer font-sans">
                    {filteredCollection&&filteredCollection.map((item:any, index:any) => (
                      <tr key={item.id} className="bg-[#282828]" onClick={() => { router.push(`/collection/${item.token_id}?tab=overview`) }}>
                        <td className="px-2">
                          <p className="flex items-center gap-2 px-2">
                            <CiStar /><p className="text-[12px]">{index + 1}</p>
                            </p>
                        </td>
                        <td className='px-2  text-[#fff] gap-4 font-light text-[12px] flex items-center my-2'>
                          <Image
                            src={
                              item.name == "Motocross" ?
                                Moto : item.name == "CageCombat Chronicles" ?
                                  MMA : item.name == "Football NFT" ?
                                    Footbal : item.name == "DesertDash" ?
                                      camel : item.name == "Cricket Legends Vault" ?
                                        cric : item.name == "PunchCraft Legends" ?
                                          boxing : item.name == "SlamDunk Dynasty" ?
                                            basket : item.name == "Speedscape Grand Prix" ?
                                              Formula : item.name == "Esport Elite Icons" ?
                                                gaming : item.name == "RallyLegends Archive" ?
                                                  rally : collectionTag}
                            alt="collectionItemImage" width={40} height={40} />
                          {item.name}</td>

                        <td className='px-4 text-[#fff] text-[12px]'>{filterCollection(item.token_id)}</td>
                        <td className='px-4 text-[#5DE98D] text-[12px]'>{filterChange(item.token_id)}%</td>
                        <td className='px-4 text-[#fff] text-[12px]'>{volumeInPrice(item.token_id)}</td>
                        <td className='px-4 text-[#5DE98D] text-[12px]'>{<VolumeChange collection={item?.token_id} />}</td>
                        <td className='px-4 text-[#fff] text-[12px]'>{item.total_supply}</td>
                        <td className='px-4 text-[#fff] text-[12px]'>{owners(item.token_id)}</td>
                        <td className='px-4 text-[#fff] text-[12px]'>{isListed(item.token_id)}</td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FeaturedCollection;

