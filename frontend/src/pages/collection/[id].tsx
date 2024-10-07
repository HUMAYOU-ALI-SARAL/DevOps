"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useUser } from "@/providers/user.provider";
import UserLayout from "@/pages/layouts/user.layout";
import Header from "@/components/User/Header/Header";
import Footer from "@/components/User/Footer";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { kFormatter, numberWithCommas } from "@/utils/common";

import InternetIcon from "@/public/icons/internet.png";
import TwitterIcon from "@/public/icons/twitter.png";
import TelegramIcon from "@/public/icons/telegram.png";
import ShareIcon from "@/public/icons/share.png";
import DiscordIcon from "@/public/icons/discord.png";

import { useTranslate } from "@/providers/translate.provider";
import Overview from "@/components/Collection/Tabs/Overview/Overview";
import Items from "@/components/Collection/Tabs/Items/Items";
import { useRouter } from "next/router";

import styles from "./styles.module.scss";
import { useGetCollectionsMutation, useGetNftsMutation, useGetUserBidsMutation } from "@/api/blockchainApi";
import { NftCollection, Nft, UserBidsType, Bid } from "@/types/blockchain.type";
import Loader from "@/components/Common/Loader";
import { setIsLoading } from "@/reducers/blade.slice";
import { useBladeWallet } from "@/providers/blade-wallet.provider";
import { TRANSACTION_PAGE_LIMIT } from "@/constants/app.constants";



const socialLinks = [
  {
    name: 'internet',
    icon: InternetIcon,
    url: '#'
  },
  {
    name: 'twitter',
    icon: TwitterIcon,
    url: '#'
  },
  {
    name: 'discord',
    icon: DiscordIcon,
    url: '#',
    width: 36,
  },
  {
    name: 'telegram',
    icon: TelegramIcon,
    url: '#'
  },
  {
    name: 'share',
    icon: ShareIcon,
    url: '#'
  },
];

interface Tab {
  label: string;
  slug: string;
  component?: React.ReactNode;
}

const Tab = ({
  label,
  active,
  setTab,
}: {
  label: string;
  setTab: () => void;
  active: boolean;
}) => {
  return (
    <p
      className={`font-normal cursor-pointer text-18 sp-gray-950 px-5 py-3 ${active ? "rounded-[5px] bg-sp-gray-600 text-[#9D9D9D]" : "font-light text-[#9D9D9D]"}`}
      onClick={setTab}
    >
      {label}
    </p>
  );
};

const CollectionPage = () => {
  const { tinyBarToHbar } = useBladeWallet();
  const { _t } = useTranslate();
  const router = useRouter();
  const { id } = router.query;
  const collectionId = router.query.id as string;
  const tab = router.query.tab as string;
  const [collection, setCollection] = useState<NftCollection>();
  const [listedPercent, setListedPercent] = useState<any>();
  const [getCollections, { isLoading }] = useGetCollectionsMutation();
  const [getNfts] = useGetNftsMutation();
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [getBids] = useGetUserBidsMutation();
  const [owners, setOwners] = useState<any>();
  const [page, setPage] = useState<number>(1);
  const [localAccountID, setLocalAccountID] = useState<string>("");
  const [urlAccountID, setUrlAccountID] = useState<string>("");
  const [bids, setBids] = useState<Bid[]>([]);
  const [volume, setVolume] = useState<any>(0);
  const [highestBid, setHighestBid] = useState<any>(0);
  const [floorChange, setFloorChange] = useState<any>();
  const [floorPrice, setFloorPrice] = useState<any>();
  const [pageNo, setPageNo] = useState<any>(1);

  useEffect(() => {
    if (id) {
      setUrlAccountID(Array.isArray(id) ? id[0] : id);
    }
  }, [id]);


  // useLayoutEffect(() => {
  useEffect(() => {
    const localWalletAccountId = localStorage.getItem("walletAccount_id");
    const localWalletAccountPrivateKey = localStorage.getItem("walletAccount_privateKey");
    if (localWalletAccountId && localWalletAccountPrivateKey) {
      setLocalAccountID(localWalletAccountId.toString());
    }
  }, []);

  useEffect(() => {
    if (collectionId) {
      fetchCollections();
      fetchNfts();
    }
  }, [collectionId, pageNo]);

  const filterCollection = nfts.filter((item) => item.token_id === collection?.token_id);

  const owner = () => {
    const ownerList = filterCollection && filterCollection.map((item: any) => item.owner?.accountId);
    console.log(ownerList);
    setOwners(ownerList);
  };

  useEffect(() => {
    if (collection) {
      setListedPercent((filterCollection.length / collection?.total_supply) * 100);
    }
    if (filterCollection.length > 0) {
      const sortArray = filterCollection.sort((item: any, item1: any) => Number(item.price) - Number(item1.price));
      sortArray.length > 0 && sortArray[0].price ? setFloorPrice(tinyBarToHbar(BigInt(sortArray[0]?.price))) : "";
    }
    // owner();
  }, [nfts, filterCollection]);

  useEffect(() => {
    if (filterCollection.length > 0) {
      const volumeInPrice = filterCollection.reduce((sum: any, item: any) => sum + Number(item.price), 0);
      setVolume(tinyBarToHbar(BigInt(volumeInPrice)));
    }
  }, [filterCollection]);

  useEffect(() => {
    const a = bids.map((item) => item);
    const b = a.sort((i, i1) => Number(i1.amount) - Number(i.amount));
    if (b.length > 1) {
      setHighestBid(tinyBarToHbar(BigInt(b[0].amount)));
    }
  }, [bids]);

  const collectionHandler = (collection: any) => {
    return collection.find((item: any) => item.token_id === collectionId);
  };

  const fetchCollections = () => {
    getCollections({})
      .unwrap()
      .then((response) => {
        const { collections } = response;
        if (collections.length) {
          const collection = collectionHandler(collections);
          console.log(collectionHandler(collections));
          setCollection(collection);
        }
      })
      .catch((error) => {
        console.log("error", error);
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
        console.log(nfts);
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

  const fetchBids = useCallback(() => {
    setIsLoading(true);
    getBids({
      accountId: localAccountID,
      page,
      pageSize: TRANSACTION_PAGE_LIMIT,
      type: UserBidsType.RECEIVED_BIDS
    })
      .unwrap()
      .then((response) => {
        const { bids } = response;
        console.log(bids);
        console.log(localAccountID);
        setBids(bids);
      })
      .catch((error) => {
        console.log(error);
      }).finally(() => {
        setIsLoading(false);
      });
  }, [page, localAccountID]);

  useEffect(() => {
    console.log(localAccountID);
    if (localAccountID) {
      fetchBids();
    }
  }, [page, localAccountID]);

  const tabList: Tab[] = [
    {
      label: _t("Overview"),
      slug: "overview",
    },
    {
      label: _t("Items"),
      slug: "items",
    },
    /* {
      label: _t("Statistics"),
      slug: "statistics",
    },
    {
      label: _t("Activity"),
      slug: "Activity",
    }, */
  ];
  const totalOwners = useCallback(() => {
    let x = 0;
    const fc = nfts.filter(item => item.token.token_id === collectionId);
    console.log(fc);
    if (fc.length > 1) {
      // Eliminate duplicates
      const uniqueArray = [];
      const seenPrices = new Set();

      for (const item of fc) {
        if (!seenPrices.has(item?.owner?.accountId)) {
          uniqueArray.push(item);
          seenPrices.add(item.owner?.accountId);
          console.log(item.metadata.name)
          console.log(item?.owner?.accountId, "this is account Id")
          console.log(item)
          x++;
        }
      }

      // Calculate the percentage change
    }
    return x
  }, [nfts, collectionId]);
  const [activeTab, setActiveTab] = useState<Tab>(tabList[0]);

  useEffect(() => {
    if (tab) {
      tabList.forEach((item, index) => {
        if (item.slug === tab) {
          setActiveTab(tabList[index]);
        }
      });
    }
  }, [tab]);


  return (
    <UserLayout title="Spheraheads" useBg={false}>
      <Header />
      <div className="relative h-full flex flex-grow flex-col">
        {!collection || isLoading ? (
          <Loader />
        ) : (
          <>
            <div className={`w-full mt-[100px]`}
              style={{
                marginTop: '-70px',
                backgroundImage: `url('${collection?.metadata?.image || "default-image-url.jpg"}')`,
                backgroundPosition: 'top',
                backgroundPositionY: '64px',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat'
              }}>
              <div className="relative w-full h-[770px] flex items-start justify-end px-[40px] flex-col border-b-[1px] border-sp-gray-650">
                <div className="w-full">
                  <div className="w-full flex flex-column md:flex-row items-start justify-between ">
                    <div>
                        <div className={`w-[80px] h-[80px] object-cover rounded-full shadow-md`}
                          style={{
                            backgroundImage: `url('${collection?.metadata?.image || "default-image-url.jpg"}')`,
                            backgroundSize: 'cover',
                            backgroundRepeat: 'no-repeat'
                          }}>
                        </div>
                      <div className="flex">
                        <p className="text-[28px] font-bold py-4">{collection?.name} {_t("Collection")}</p>
                        <div className="flex items-center space-x-4 px-10">
                          {socialLinks.map((link, index: number) => (
                            <Link href={link.url} key={index}>
                              <Image src={link.icon} alt={link.name} width={link.width || 26} />
                            </Link>
                          ))}
                        </div>
                      </div>
                      <p className="text-[16px] font-extralight max-w-[370px]">
                        {collection.metadata?.description}
                      </p>
                      <div className="flex mt-5 text-[16px] gap-3 font-inter whitespace-nowrap 2xl:flex-wrap">
                        <div className="flex space-x-3">
                          <p className="font-normal">{_t("Total items:")}</p>
                          <p className="font-medium">{kFormatter(collection?.max_supply || 0)}</p>
                        </div>
                        <div className="flex space-x-3">
                          <p className="font-normal">{_t("Created:")}</p>
                          <p className="font-medium">{format(new Date(collection?.created_timestamp! || 0), "LLL u")}</p>
                        </div>
                        <div className="flex space-x-3">
                          <p className="font-normal">{_t("Royalties:")}</p>
                          <p className="font-medium">{collection?.royalty_fee! * 100 || 0}%</p>
                        </div>
                        <div className="flex space-x-3">
                          <p className="font-normal">{_t("Chain:")}</p>
                          <p className="font-medium">Hedera</p>
                        </div>
                      </div>
                      <div className="flex space-x-2 py-5 items-center">
                        {tabList.map((tab, index) => (
                          <Tab
                            setTab={() => setActiveTab(tab)}
                            key={index}
                            label={tab.label}
                            active={activeTab.slug === tab.slug}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-6 pt-10 whitespace-nowrap 2xl:flex-wrap pl-5 rtl:pr-5">
                      <div className="flex items-center justify-center flex-col">
                        <p className="text-sp-gray-100 text-[18px]">{_t("Total Volume")}</p>
                        <p className="text-[26px] text-white font-bold">{volume}</p>
                      </div>
                      <div className="flex items-center justify-center flex-col">
                        <p className="text-sp-gray-100 text-[18px]">{_t("Floor Price")}</p>
                        <p className="text-[26px] text-white font-bold">{floorPrice || 0}</p>
                      </div>
                      <div className="flex items-center justify-center flex-col">
                        <p className="text-sp-gray-100 text-[18px]">{_t("Best Offer")}</p>
                        <p className="text-[26px] text-white font-bold">{highestBid || 0}</p>
                      </div>
                      <div className="flex items-center justify-center flex-col">
                        <p className="text-sp-gray-100 text-[18px]">{_t("Listed")}</p>
                        <p className="text-[26px] text-white font-bold">{listedPercent || 0}%</p>
                      </div>
                      <div className="flex items-center justify-center flex-col">
                        <p className="text-sp-gray-100 text-[18px]">{_t("Owners")}</p>
                        <p className="text-[26px] text-white font-bold">{totalOwners() || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              {activeTab.slug === 'overview' &&
                <Overview collection={collection} urlID={urlAccountID} />
              }
              {activeTab.slug === 'items' &&
                <Items collection={collection} />
              }
            </div>
          </>
        )}
      </div>
      <Footer />
    </UserLayout>
  );
};

export default CollectionPage;