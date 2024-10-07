import React from "react";
import { NftCollection } from "@/types/blockchain.type";
import { useRouter } from "next/router";
import { useTranslate } from "@/providers/translate.provider";

const CollectionItem = ({
  collection,
  action,
  width,
  height,
  onMarketPage,
}: {
  collection: NftCollection;
  action?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  onMarketPage?: boolean; 
}) => {
  const router = useRouter();
  
  const { _t } = useTranslate();
  const seconds = Number(collection.created_timestamp); // Example seconds

  // Convert seconds to milliseconds by multiplying with 1000
  const milliseconds = seconds * 1000;
  
  // Create a new Date object using the milliseconds
  const date = new Date(milliseconds);
  // console.log(date.getMonth(),date.getDay(),date.getDate())
  // console.log(collection)
  // Output the date in a readable format
  // console.log("totalItem",collection.total_supply)
  // console.log("Date",date);
  // console.log(collection.max_supply)  
  // console.log(collection.owners)
  // console.log(collection.best_offer)
  // console.log(collection.minted_count)
  const id = collection.token_id;
  return (
    <div
      className="bg-pattern shadow-[0px_4px_75px_-5px_rgba(0,0,0,0.07)] bg-sp-gray-600 relative overflow-hidden mobile:!w-full max-w-[520px] rounded-[10px] cursor-pointer"
      style={{ height: height || "356px", width: width || "283px" }}
      onClick={() => { router.push(`/collection/${id}?tab=overview`) }}
    >
      <div className="absolute inset-0 h-[60%]">
        <img
          alt="image"
          src={collection?.metadata?.image}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="absolute inset-0 top-[60%] flex justify-between p-3">
        <div className="flex flex-col gap-1 items-start">
          <span className={onMarketPage ? 'text-20 whitespace-nowrap	 uppercase font-bold' : 'text-base'}>{collection.name}</span>
          <div className="flex gap-6 font-inter items-start">

            <div className="flex flex-col items-start text-16">
              <span className="font-light text-sp-gray-999">{_t("Total")}</span>
              <span className="font-medium">
                {collection.total_supply}
              </span>
            </div>
            <div className="flex flex-col items-start text-16">
              <span className="font-light text-sp-gray-999">{_t("Price range")}</span>
              <span className="font-medium whitespace-nowrap">
                12 - 57 HBAR
              </span>
            </div>
            <div className="flex flex-col items-start text-16">
              <span className="font-light text-sp-gray-999">{_t("Minted")}</span>
              <span className="font-medium">
                {collection.minted_count || 5}%
              </span>
            </div>
          </div>
         
        </div>
        <div>
        </div>
        <div className="flex flex-col items-end justify-between">
          {action}
        </div>
      </div>
    </div>
  );
};

export default CollectionItem;
