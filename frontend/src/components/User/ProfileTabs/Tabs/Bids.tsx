import React, { useCallback, useEffect, useState } from 'react';
import NftItem from '@/components/Items/Nft/NftItem';
import {
  useGetUserBidsMutation,
  useSendNftDealMutation,
  useSendNftListingMutation,
} from '@/api/blockchainApi';
import { UserProfileType } from '@/types/user.type';
import {
  MIRROR_NODE_REFRESH_TIME,
  TRANSACTION_PAGE_LIMIT,
  WALLET_REGEX,
} from '@/constants/app.constants';
import { Bid, UserBidsType } from '@/types/blockchain.type';
import { useTranslate } from '@/providers/translate.provider';
import { useBladeWallet } from '@/providers/blade-wallet.provider';
import Button from '@/components/Common/Button';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import Pagination from '@/components/Common/Pagination';
import Loader from '@/components/Common/Loader';
import { floorDifference } from '@/utils/common';
import { formatDistanceStrict } from 'date-fns';
import { Cross } from '@/components/Common/Icons';
import { LuLoader } from 'react-icons/lu';

type Props = {
  userProfile: UserProfileType;
  isOwner?: boolean;
};
// import React from "react";
// import { LuLoader } from "react-icons/lu";

// type Props = {
//   onClick?: () => void;
//   label: string;
//   className?: string;
//   type?: "submit" | "reset" | "button" | undefined;
//   disabled?: boolean;
//   isLoading?: boolean;
// };

// const Button = ({ onClick, label, className, type, disabled, isLoading }: Props) => {
//   return (
//     <button
//       type={type}
//       disabled={disabled}
//       className={`text-black relative bg-orange hover:bg-orange-hover min-h-[40px] font-light text-md px-3 py-1.5 ${disabled ? "opacity-50 cursor-not-allowed" : ""
//         } ${className ?? ""}`}
//       onClick={onClick}
//     >
//       {isLoading ? (
//         <div className="flex items-center justify-center">
//           <div className="animate-spin">
//             <LuLoader color="#ffffff" />
//           </div>
//         </div>
//       )
//         : (label)}
//     </button>
//   );
// };

const Bids = ({ userProfile, isOwner }: Props) => {
  const { _t } = useTranslate();
  const router = useRouter();
  const [bids, setBids] = useState<Bid[]>([]);
  const { tinyBarToHbar, acceptBid, evmToToken, deleteBid } = useBladeWallet();
  const [isLastPage, setIsLastPage] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [getBids] = useGetUserBidsMutation();
  const [nftListing] = useSendNftListingMutation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nftDeal] = useSendNftDealMutation();

  const tableHeader = [
    _t('Item'),
    _t('From'),
    _t('Price'),
    _t('NFT worth'),
    _t('Owner'),
    _t('Action'),
  ];
  const cancelOfferHandler = async (bid: Bid) => {
    console.log(bid.nft.owner?.accountId)
    try {
      await deleteBid(
        bid.tokenId.match(WALLET_REGEX) ? bid.tokenId : evmToToken(bid.tokenId),
        bid.serialNumber,
        bid.ownerEvmAddress,
      );
      toast.success(_t('Success'));
      setTimeout(() => {
        fetchBids();
      }, MIRROR_NODE_REFRESH_TIME);
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const acceptOfferHandler = async (bid: Bid) => {
    try {
      const transactionId = await acceptBid(
        bid.tokenId.match(WALLET_REGEX) ? bid.tokenId : evmToToken(bid.tokenId),
        bid.serialNumber,
        bid.ownerEvmAddress,
        bid.amount,
      );
      toast.success(_t('Success'));
      nftListing({
        nfts: [bid.nft],
        price: 0,
        isListed: false,
        listingEndTimestamp: 0,
      });
      nftDeal({
        ownerId: userProfile?.accountId!,
        buyerId: bid.ownerAccountId,
        transactionId,
        price: bid.amount,
        tokenId: evmToToken(bid.tokenId),
        serialNumber: bid.serialNumber,
      });

      setIsLoading(true);
      setTimeout(() => {
        fetchBids();
      }, MIRROR_NODE_REFRESH_TIME);
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const fetchBids = useCallback(() => {
    setIsLoading(true);
    getBids({
      accountId: userProfile?.accountId!,
      page,
      pageSize: TRANSACTION_PAGE_LIMIT,
      type: UserBidsType.RECEIVED_BIDS,
    })
      .unwrap()
      .then((response) => {
        const { bids } = response;
        setBids(bids);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [page]);

  useEffect(() => {
    fetchBids();
  }, [page]);

  return (
    <div
      className="w-full py-8 px-[55px] overflow-x-auto relative bg-[#1c1c1c]"
      style={{
        boxShadow: "rgba(0, 0, 0, 0.3) 0px -5px 15px 0px",
        borderRadius: "30px 30px 0px 0px"
      }}
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center justify-start gap-2'>
          <div className='bg-[#FF7F2A] p-3 rounded-md w-[160px] text-center cursor-pointer'>Offers Recieved</div>
          <div className='bg-[#242424] p-3 rounded-md w-[160px] text-center cursor-pointer'>Offers Sent</div>
        </div>

        <div>
          <select className='px-4 p-2 bg-[#1c1c1c] border rounded-md'>
            <option value='latest'>Latest</option>
            <option value='old'>Old</option>
          </select>
        </div>

      </div>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <table className="min-w-full text-white">
            <thead className="">
              <tr>
                {tableHeader.map((name, index) => (
                  <th
                    key={index}
                    className="py-[50px] text-start font-normal"
                    style={{
                      padding: index === 0 ? '44px' : '',
                    }}
                  >
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bids?.map((bid, index) => (
                <tr
                  key={`bid-${index}`}
                  className="bg-[#242424]"
                  style={{ borderBottom: '18px solid #111111E6' }}
                >
                  <td className="px-[35px] py-[40px]">
                    <div className="flex gap-2 justify-start items-center">
                      <NftItem tab={true} nft={bid.nft} width={'68px'} height={'68px'} />
                    </div>
                  </td>
                  <td className="p-2 text-start">
                    {bid.username ? bid.username : bid.ownerAccountId}
                  </td>
                  <td className="p-2 text-start">{tinyBarToHbar(bid.amount)}</td>
                  <td className={`p-2 text-start`}>
                    <p>{bid?.nft?.price ? tinyBarToHbar(BigInt(bid?.nft?.price)) : "0"}</p>
                  </td>
                  <td className="p-2 text-start">
                    <p>{bid?.nft?.owner?.accountId}</p>
                  </td>

                  <td className="p-2 text-start">
                    {isOwner && (
                      // <Button
                      //   type="button"
                      //   onClick={() => acceptOfferHandler(bid)}
                      //   className="text-white rounded-[5px]"
                      //   label={_t("Accept")}
                      // />
                      <div className="flex gap-[10px]">
                        <button
                          onClick={() => acceptOfferHandler(bid)}
                          className="text-orange relative bg-[#FF7F2A0F] hover:bg-orange-hover min-h-[40px] font-light text-md px-7 py-2 rounded-[50px]"
                          style={{ border: '1px solid orange' }}
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin">
                                <LuLoader color="#ffffff" />
                              </div>
                            </div>
                          ) : (
                            'Accept'
                          )}
                        </button>

                        {/* <div onClick={() => cancelOfferHandler(bid)}>
                          {isLoading ? (
                            <div className="flex items-center justify-center" >
                              <div className="animate-spin">
                                <LuLoader color="#ffffff" />
                              </div>
                            </div>
                          ) : (
                            <Cross  />
                          )}
                        </div> */}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex pt-6 items-center justify-end">
            <Pagination page={page} setPage={setPage} isLastPage={isLastPage} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Bids;
