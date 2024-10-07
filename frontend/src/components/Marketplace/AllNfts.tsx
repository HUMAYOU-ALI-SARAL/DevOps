import React, { useCallback, useEffect, useState } from "react";
import { useGetNftsMutation } from "@/api/blockchainApi";
import Button from "../Common/Button";
import NftItem from "../Items/Nft/NftItem";
import Loader from "../Common/Loader";
import { Nft, NftsRequest } from "@/types/blockchain.type";
import Link from "next/link";
import ItemGrid from "../User/ProfileTabs/Tabs/Common/ItemsGrid";
import Filters from "../User/ProfileTabs/Tabs/Common/Filters";


const AllNfts = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nfts, setNfts] = useState<Nft[]>([]);

  const [isLastPage, setIsLastPage] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [getNfts, getNftsStatus] = useGetNftsMutation();
  const [searchQuery, setSearchQuery] = useState<string>(""); 

  const fetchNfts = useCallback(
    (searchQuery?: string) => {
      setIsLoading(true);
      let query: NftsRequest = {
        page,
        pageSize: 12,
        searchQuery,
        isMarketListed:true
      };
     
      getNfts(query)
        .unwrap()
        .then((response: any) => {
          const { isLastPage, nfts } = response;
          setNfts(nfts);
          setIsLastPage(isLastPage);
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [page]
  );

  const handleSearch = () => {
    if (page > 1) {
      setPage(1);
    } else {
      fetchNfts(searchQuery);
    }
  };
  useEffect(() => {
    fetchNfts();
  }, [page]);
  return (
    <>
      <div className="flex items-center justify-between w-full pr-3 rtl:pl-3">
        {/* <span className="text-[32px] text-start">Recent Listings</span> */}
        {/* <Link href='/allNfts'>
        <Button className="bg-sp-gray-600 text-white rounded-[5px]" label="See all" />
        </Link> */}
      </div>
      <div className="flex flex-col w-full h-full px-8 gap-6">
        <Filters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={handleSearch}
        />
        <ItemGrid
          isLoading={isLoading || getNftsStatus.isLoading}
          page={page}
          setPage={setPage}
          isLastPage={isLastPage}
          pagination
        >

        {nfts.map((nft) => (
          <NftItem
          key={`${nft.token_id}-${nft.serial_number}`}
          nft={nft}
          tab={false}
          />
        ))}
        </ItemGrid>
        {/* {(isLoading || getNftsStatus.isLoading) && <Loader />} */}
      </div>
    </>
  );
};

export default AllNfts;
