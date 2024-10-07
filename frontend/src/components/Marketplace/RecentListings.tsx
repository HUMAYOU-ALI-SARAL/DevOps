import React, { useEffect, useState } from "react";
import { useGetNftsMutation } from "@/api/blockchainApi";
import Button from "../Common/Button";
import NftItem from "../Items/Nft/NftMarketItem";
import Loader from "../Common/Loader";
import { Nft } from "@/types/blockchain.type";
import Link from "next/link";


const RecentListings = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nfts, setNfts] = useState<Nft[]>([]);

  const [getNfts, getNftsStatus] = useGetNftsMutation();

  const fetchNfts = () => {
    setIsLoading(true);

    getNfts({
      pageSize: 8,
      orderDirection: "desc",
      isMarketListed: true,
    })
      .unwrap()
      .then((response) => {
        const { nfts } = response;
        setNfts(nfts);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchNfts();
  }, []);

  return (
    <>
      <div className="flex items-center justify-between w-full pr-3 rtl:pl-3">
        <span className="text-[24px] text-start">Recent Listings</span>
        <Link href='/allNfts'>
          <Button className="bg-sp-gray-600 text-white rounded-[5px]" label="See all" />
        </Link>
      </div>
      <div className="relative flex gap-7 mobile:flex-col flex-wrap tablet:justify-center mt-6">
        {nfts.map((nft) => (
          <NftItem
            key={`${nft.token_id}-${nft.serial_number}`}
            nft={nft}
            width="23%"
          />
        ))}
        {(isLoading || getNftsStatus.isLoading) && <Loader />}
      </div>
    </>
  );
};

export default RecentListings;
