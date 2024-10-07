import React, { useCallback, useEffect, useState } from "react";
import { useGetNftsMutation, useGetNftClaimMutation } from "@/api/blockchainApi";
import ItemsGrid from "./Common/ItemsGrid";
import NftItem from "@/components/Items/Nft/NftItem";
import { NFT_PAGE_LIMIT } from "@/constants/app.constants";
import { Nft, NftsRequest } from "@/types/blockchain.type";
import { UserProfileType } from "@/types/user.type";
import UserIdInfo from "../../UserIdInfo/UserInfo";
import Slider from "@/components/Slider/Slider";
import { SearchIcon, BigGridIcon, GridIcon } from "@/components/Common/Icons";
import Input from "@/components/Common/Input";
import Select from "@/components/Common/Select";
import styles from '../../styles.module.scss';
import router from "next/router";

type Props = {
  userProfile: UserProfileType;
};

type NftClaimData = {
  account_id: string;
  id: number;
  image: string;
  name: string;
  video?: string;
};

const AllItems = ({ userProfile }: Props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLastPage, setIsLastPage] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>(""); // Single search state
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [filteredNfts, setFilteredNfts] = useState<Nft[]>([]); // Filtered NFTs
  const [filter, setFilter] = useState<string>("all");
  const [nftClaim, setNftClaim] = useState<NftClaimData | null>(null);
  const [getNfts, getNftsStatus] = useGetNftsMutation();
  const [getNftClaim] = useGetNftClaimMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchNfts();
  }, [page, filter]); // Fetch when page or filter changes

  useEffect(() => {
    if (userProfile.accountId) {
      getNftClaim({ accountId: userProfile.accountId }).unwrap()
        // .then(setNftClaim)
        // .catch(console.error);
    }
  }, [userProfile.accountId]);

  const fetchNfts = useCallback(() => {
    setIsLoading(true);
    const query: NftsRequest = {
      accountId: userProfile?.accountId,
      page,
      pageSize: NFT_PAGE_LIMIT,
    };
    if (filter === 'listed') {
      query.isMarketListed = true;
    }
    getNfts(query)
      .unwrap()
      .then(({ isLastPage, nfts }) => {
        setNfts(nfts); 
        setIsLastPage(isLastPage);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [page, filter, userProfile.accountId]);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  useEffect(() => {
    const filtered = search
      ? nfts.filter(nft => nft?.metadata?.name.toLowerCase().includes(search.toLowerCase()))
      : nfts;
    setFilteredNfts(filtered);
  }, [search, nfts]); 

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value); // Update the search state
  };

  const combinedNfts = nftClaim ? [nftClaim as unknown as Nft, ...filteredNfts] : filteredNfts;

  return (
    <div className="bg-[#1c1c1c] h-full">
      <Slider />
      <UserIdInfo userProfile={userProfile} />

      <div className="w-[90%] m-auto mt-24">
        <div>
          <h2 className="text-[18px] mb-[5px] pr-[40px] font-blackHanSans font-bold uppercase">COLLECTIONS</h2>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <p className="text-[16px] font-light">Select All</p>
              <input type="checkbox" style={{ width: "18px", height: "18px", backgroundColor: "transparent", border: '2px solid white', borderRadius: '3px' }} />
              <p className="text-[16px] font-light">List</p>
              <p className="text-[16px] font-light">Transfer</p>
              <Input
                leftAdornment={<SearchIcon className="text-placeholder cursor-pointer" />}
                placeholder="Search for NFTs..."
                value={search} // Bind input value to the `search` state
                onChange={handleSearchChange} // Handle search input change
              />
            </div>
            <div className='flex items-center gap-2'>
              <button className="hover:bg-slate-200 hover:text-orange p-1 rounded-md">
                <GridIcon />
              </button>
              <button className="hover:bg-slate-200 hover:text-orange p-1 rounded-md">
                <BigGridIcon />
              </button>
              <div className="flex gap-6 items-center text-[16px] font-light">
                <Select
                  options={[
                    { label: "All", value: "all" },
                    { label: "Listed", value: "listed" }
                  ]}
                  label="Status:"
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={`w-full h-[100vh] my-2 overflow-y-auto ${styles.customscrollbar}`}>
          <div className="flex flex-wrap justify-start items-center mt-12">
            <ItemsGrid
              isLoading={isLoading || getNftsStatus.isLoading}
              page={page}
              setPage={setPage}
              isLastPage={isLastPage}
            >
              {combinedNfts.map((nft, index) => (
                <NftItem
                  key={nft.serial_number || index} // Ensure a key even if token_id is not present for nftClaim
                  nft={nft}
                  isNftClaim={index === 0 && nftClaim ? true : false} // Mark the first item as nftClaim
                  onClick={() => {
                    if (index === 0 && nftClaim) {
                      toggleModal();
                    } else {
                      router.push(`/nft/${nft.token_id}/?serial=${nft.serial_number}`);
                    }
                  }}
                />
              ))}
            </ItemsGrid>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 mt-24">
            <div className="bg-[#000] p-4 rounded-lg shadow-lg w-[400px] h-[500px] relative" style={{ boxShadow: "0px 0px 4px 4px #ffa50099", borderRadius:'15px', border:"2px solid #fff" }}>
              <button
                onClick={toggleModal}
                className="absolute top-2 right-2 text-white text-2xl"
              >
                &times;
              </button>
              <video
                controls
                autoPlay
                className="w-full h-full object-contain"
              >
                <source src={nftClaim?.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllItems;
