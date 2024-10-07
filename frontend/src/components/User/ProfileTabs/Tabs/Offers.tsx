import React, { useCallback, useEffect, useState } from "react";
import NftItem from "@/components/Items/Nft/NftItem";
import { useGetUserBidsMutation } from "@/api/blockchainApi";
import { UserProfileType } from "@/types/user.type";
import { MIRROR_NODE_REFRESH_TIME, TRANSACTION_PAGE_LIMIT, WALLET_REGEX } from "@/constants/app.constants";
import { Bid, UserBidsType } from "@/types/blockchain.type";
import { useTranslate } from "@/providers/translate.provider";
import { useBladeWallet } from "@/providers/blade-wallet.provider";
import Button from "@/components/Common/Button";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import Pagination from "@/components/Common/Pagination";
import Loader from "@/components/Common/Loader";
import { floorDifference } from "@/utils/common";
import { formatDistanceStrict } from "date-fns";
import { Cross } from "@/components/Common/Icons";
import { LuLoader } from "react-icons/lu";

type Props = {
  userProfile: UserProfileType;
  isOwner?: boolean;
};

const Offers = ({ userProfile, isOwner }: Props) => {
  const { _t } = useTranslate();
  const router = useRouter();
  const [bids, setBids] = useState<Bid[]>([]);
  const { tinyBarToHbar, deleteBid, evmToToken } = useBladeWallet();
  const [isLastPage, setIsLastPage] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [getBids, { isLoading }] = useGetUserBidsMutation();

  const tableHeader = [
    _t("Item"),
    _t("Token id"),
    _t("Owner"),
    _t("Price"),
    _t("Placed bid"),
    _t("Status"),
  ];

  const cancelOfferHandler = async (bid: Bid) => {
    try {
      await deleteBid(
        bid.tokenId.match(WALLET_REGEX) ? bid.tokenId : evmToToken(bid.tokenId),
        bid.serialNumber,
        bid.ownerEvmAddress,
      );
      toast.success(_t("Success"));
      setTimeout(() => {
        fetchBids();
      }, MIRROR_NODE_REFRESH_TIME);
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const fetchBids = useCallback(() => {
    getBids({
      accountId: userProfile?.accountId!,
      page,
      pageSize: TRANSACTION_PAGE_LIMIT,
      type: UserBidsType.SENT_BIDS
    })
      .unwrap()
      .then((response) => {
        const { bids } = response;
        setBids(bids);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [page]);

  useEffect(() => {
    fetchBids();
  }, [page]);

  return (
    <div className="w-full p-8 overflow-x-auto relative bg-[#1c1c1c]"
      style={{
        boxShadow: "rgba(0, 0, 0, 0.3) 0px -5px 15px 0px",
        borderRadius: "30px 30px 0px 0px"
      }}
    >
      {isLoading
        ? <Loader />
        :
        <div>
          <div className="font-bold text-[22px] mt-8 ml-8">BIDS</div>
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
                    {bid.nft.token_id}
                  </td>
                  <td className="p-2 text-start">
                    {bid.username ? bid.nft.owner?.firstName : bid.nft.owner?.accountId}
                  </td>
                  <td className={`p-2 text-start`}>
                    <p>{bid.nft.price ? tinyBarToHbar(BigInt(bid?.nft?.price)) : "0"}</p>
                  </td>
                  <td className="p-2 text-start">{tinyBarToHbar(bid.amount)}</td>


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
                          className="text-orange relative bg-[#FF7F2A0F]  min-h-[40px] font-light text-md px-7 py-2 rounded-[50px]"
                          style={{ border: '1px solid orange' }}
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin">
                                <LuLoader color="#ffffff" />
                              </div>
                            </div>
                          ) : (
                            'Ongoing'
                          )}
                        </button>

                        <div onClick={() => cancelOfferHandler(bid)}>
                          {isLoading ? (
                            <div className="flex items-center justify-center" >
                              <div className="animate-spin">
                                <LuLoader color="#ffffff" />
                              </div>
                            </div>
                          ) : (
                            <Cross />

                          )}
                        </div>
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
      }
    </div>
  );
};

export default Offers;
