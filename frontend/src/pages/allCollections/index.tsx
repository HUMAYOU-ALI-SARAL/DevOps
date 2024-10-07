import React, { useCallback, useEffect, useState } from "react";
import UserLayout from "@/pages/layouts/user.layout";
import { useGetCollectionsMutation, useGetNftsMutation } from "@/api/blockchainApi";
import Header from "@/components/User/Header/Header";
import Footer from "@/components/User/Footer";
import styles from "./styles.module.scss";
import Input from "@/components/Common/Input";
import { SearchIcon } from "@/components/Common/Icons";
import Image from 'next/image';
import hbr from '@/public/img/collection/spheraheads/hbr.png';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { FaChevronRight } from "react-icons/fa6";
import Card from '../../components/Collection/Card'
import { NftCollection, Nft } from "@/types/blockchain.type";
import { useBladeWallet } from "@/providers/blade-wallet.provider";
import Loader from '../../components/Common/Loader'
import { useRef } from 'react';;
import VolumeChange from "./VolumeChange";
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
import { IoLogoReact } from "react-icons/io5";
import { FaRing } from "react-icons/fa";
import { CiStar } from "react-icons/ci";
import FloorPrice from "./FloorPrice";
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import 'swiper/css';


const Index = () => {

    const { tinyBarToHbar } = useBladeWallet();
    const [isCollectionsLoading, setIsCollectionsLoading] = useState(true);
    const [collections, setCollections] = useState<NftCollection[]>([]);
    const [filteredCollection, setFilteredCollections] = useState<NftCollection[]>([]);
    const [getCollections, getCollectionsStatus] = useGetCollectionsMutation();
    const [nfts, setNfts] = useState<Nft[]>([]);
    const [search, setSearch] = useState<string>("");
    const [getNfts] = useGetNftsMutation();
    const swiperRef = useRef<any>(null);
    const router = useRouter();
    const [pageNo, setPageNo] = useState<any>(1);

    useEffect(() => {
        fetchCollections();
    }, []);

    useEffect(() => {
        fetchNfts();
    }, [pageNo]);

    const fetchCollections = () => {
        setIsCollectionsLoading(true);
        getCollections({})
            .unwrap()
            .then((response) => {
                const { collections } = response;
                setCollections(collections);
                setFilteredCollections(collections); // Set filtered collections here
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setIsCollectionsLoading(false);
            });
    };

    const fetchNfts = useCallback(() => {
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
            });
    }, [pageNo]);

    const isListed = useCallback((tokenId: string) => {
        const fc = nfts.filter(item => item.token.token_id === tokenId);
        return fc.length;
    }, [nfts, pageNo]);

    const owners = useCallback((tokenId: string) => {
        let x = 0;
        const fc = nfts.filter(item => item.token.token_id === tokenId);
        if (fc.length > 1) {
            const uniqueArray = [];
            const seenPrices = new Set();

            for (const item of fc) {
                if (!seenPrices.has(item?.owner?.accountId)) {
                    uniqueArray.push(item);
                    seenPrices.add(item.owner?.accountId);
                    x++;
                }
            }
        }
        return x;
    }, [nfts]);

    const filterChange = useCallback((tokenId: string) => {
        const fc = nfts.filter(item => item.token.token_id === tokenId);

        if (fc.length > 1) {
            const sortedArray = fc.sort((a, b) => Number(a.price) - Number(b.price));

            const uniqueArray = [];
            const seenPrices = new Set();

            for (const item of sortedArray) {
                if (!seenPrices.has(item.price)) {
                    uniqueArray.push(item);
                    seenPrices.add(item.price);
                }
            }

            return uniqueArray.length > 1
                ? (((Number(uniqueArray[1].price) - Number(uniqueArray[0].price)) / Number(uniqueArray[0]?.price)) * 100).toFixed(2)
                : "";
        }
        return tinyBarToHbar(BigInt(0));
    }, [nfts]);

    const volumeInPrice = useCallback((tokenId: string) => {
        const hbar = nfts.filter(item => item.token.token_id === tokenId).reduce((sum, item) => sum + Number(item.price), 0);
        const tinyhbar = hbar / 100000000;
        return tinyhbar;
    }, [nfts, pageNo]);

    const collectionHandler = (event: any) => {
        setSearch(event.target.value);
        const fc = event.target.value !== "" ? collections.filter(item => ((item.name).toLowerCase().includes(search.toLowerCase()))) : collections;
        fc && setFilteredCollections(fc);
    };

    const Next = () => { if (swiperRef.current && swiperRef.current?.swiper) { swiperRef?.current?.swiper.slideNext() } };
    const Prev = () => { if (swiperRef.current && swiperRef.current?.swiper) { swiperRef?.current?.swiper.slidePrev() } };

    return (
        <>
            <UserLayout title="Spheraheads" useBg={false}>
                <Header />
                <div className={`${styles.full} w-full`}>
                    {isCollectionsLoading ? (
                        <Loader />
                    ) : (
                        <>
                            <div className="w-full border-sp-gray-650">
                                <div className={`flex flex-col items-center gap-4`}>
                                    <h2 className='text-[70px] font-bold mt-[80px] text-[#fff]'>Collection page</h2>
                                    <p className='text-[18px] w-[450px] text-center font-extralight'>There are 500+ collections available in the market. Dive into the sphera world to see what amazing collection you will be joining today.</p>
                                </div>
                            </div>
                            <div className='w-[100%] flex justify-center items-center mt-[-80px]'>
                                <div className='w-[65%] relative'>
                                    <Swiper
                                        ref={swiperRef}
                                        modules={[Pagination, Autoplay]}
                                        autoplay={{ delay: 2000 }}
                                        loop={true}
                                        style={{ width: '100%' }}
                                        slidesPerView={1}
                                        spaceBetween={10}
                                        breakpoints={{
                                            640: {
                                                slidesPerView: 2,
                                                spaceBetween: 10,
                                            },
                                            768: {
                                                slidesPerView: 3,
                                                spaceBetween: 20,
                                            },
                                            1024: {
                                                slidesPerView: 4,
                                                spaceBetween: 20,
                                            },
                                        }}
                                    >
                                        {
                                            collections.map((item, index) => {
                                                return item.metadata?.image && <SwiperSlide key={index} className='w-[500px] flex justify-center items-center'>
                                                    <Card
                                                        Colimage={item.metadata?.image}
                                                        description={item.metadata.description}
                                                        name={item.metadata.name}
                                                        router={router}
                                                        tokenId={item.token_id}
                                                    />
                                                </SwiperSlide>
                                            })
                                        }
                                    </Swiper>
                                    <div onClick={Prev} className='absolute left-[-25px] top-[46%] max-w-[50px] h-[50x] z-50 p-3 bg-[#434343] rounded-xl cursor-pointer'>
                                        <FaChevronRight style={{ transform: 'rotate(180deg)', width: "100%" }} size={12} color='white' />
                                    </div>
                                    <div onClick={Next} className='absolute right-[-25px] top-[46%] max-w-[50px] h-[50x] z-50 p-3 bg-[#434343] rounded-xl cursor-pointer'>
                                        <FaChevronRight style={{ width: "100%" }} size={12} color='white' />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <div className='w-[98%] h-[140vh] m-auto rounded-lg font-bold mb-12'>
                    <div className='w-[88%] m-[auto] flex justify-between items-center my-2'>
                        <div>
                            <p className='text-[12px] text-[#BFC4CA]'>TRENDING</p>
                        </div>
                        <div>
                            <div className='flex items-center gap-3'>
                                <span className='text-[12px] text-[#BFC4CA]'>1h</span>
                                <span className='text-[12px] text-[#BFC4CA]'>24h</span>
                                <span className='text-[12px] text-[#BFC4CA]'>7d</span>
                                <span className='text-[12px]'><IoLogoReact /></span>
                                <span className='text-[12px]'><FaRing /></span>
                                <span>
                                    <input
                                        type="text"
                                        className="min-w-[600px] bg-sp-gray h-7 border border-grar-800 placeholder-neutral-500 text-white text-[14px] rounded-md focus:ring-orange-hover focus:border-orange-hover p-1.5"
                                        placeholder="Filter by collection"
                                        onChange={collectionHandler}
                                        value={search}
                                    />
                                </span>
                                <span className='text-[12px] text-[#BFC4CA]'>FILTERS</span>
                                <span className='text-[12px] text-[#BFC4CA]'>FAVORITES</span>
                                <span className='text-[12px] text-[#BFC4CA]'>INVENTORY</span>
                            </div>
                        </div>
                    </div>
                    <div className='w-[90%] m-[auto] rounded-2xl overflow-hidden bg-[#282828] py-8'>
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
                                {filteredCollection.map((item, index) => (
                                    <tr key={index} onClick={() => { router.push(`/collection/${item.token_id}?tab=overview`) }}>
                                        <td className="px-2 py-3">
                                            <p className="flex items-center gap-2 px-2 font-thin">
                                                <CiStar /> <p className="text-[12px]"> {index + 1}</p>
                                            </p>
                                        </td>
                                        <td className='px-2 py-3 text-[#fff]  gap-2 font-thin text-[12px] flex items-center'>
                                            <Image src={item.name == "Motocross" ? Moto : item.name == "CageCombat Chronicles" ? MMA : item.name == "Football NFT" ? Footbal : item.name == "DesertDash" ? camel : item.name == "Cricket Legends Vault" ? cric : item.name == "PunchCraft Legends" ? boxing : item.name == "SlamDunk Dynasty" ? basket : item.name == "Speedscape Grand Prix" ? Formula : item.name == "Esport Elite Icons" ? gaming : item.name == "RallyLegends Archive" ? rally : collectionTag} alt="collectionItemImage" width={40} height={40} />
                                            {item.name}
                                        </td>
                                        <td className='px-4 text-[#fff] text-[12px] font-thin'>{<FloorPrice collection={item?.token_id} />}</td>
                                        <td className='px-4 text-[#5DE98D] text-[12px] font-thin'>{filterChange(item.token_id)}%</td>
                                        <td className='px-4  text-[12px] font-thin'>{volumeInPrice(item.token_id)}</td>
                                        <td className='px-4 text-[#5DE98D] text-[12px] font-thin'>{<VolumeChange collection={item?.token_id} />}</td>
                                        <td className='px-4 text-[#fff] text-[12px] font-thin'>{item.total_supply}</td>
                                        <td className='px-4 text-[#fff] text-[12px] font-thin'>{owners(item.token_id)}</td>
                                        <td className='px-4 text-[#fff] text-[12px] font-thin'>{isListed(item.token_id)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <Footer />
            </UserLayout></>

    )
}

export default Index;
