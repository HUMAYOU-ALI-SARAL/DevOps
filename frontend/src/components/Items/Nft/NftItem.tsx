"use client";
import React from "react";
import { HeartIcon } from "../../Common/Icons";
import { Nft } from "@/types/blockchain.type";
import { useRouter } from "next/router";
import Checkbox from "@/components/Common/Checkbox";
import { useBladeWallet } from "@/providers/blade-wallet.provider";

const NftItem = ({
  nft,
  action,
  width,
  height,
  useSelect,
  onChange,
  isChecked,
  tab = false,
  onClick,
  isNftClaim = false, // Flag for nftClaim
}: {
  nft: Nft;
  action?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  useSelect?: boolean;
  onChange?: (state: boolean) => void;
  isChecked?: boolean;
  tab?: boolean;
  onClick?: () => void;
  isNftClaim?: boolean; // Flag for nftClaim
}) => {
  const router = useRouter();
  const { tinyBarToHbar } = useBladeWallet();


  return (
    <div className="mt-[-30px]">
      <div
        onClick={(event) => {
          const target = event.target as HTMLInputElement;
          if (target.type !== 'checkbox') {
            if (onClick) {
              onClick();
            } else {
              router.push(`/nft/${nft.token_id}/?serial=${nft.serial_number}`);
            }
          }
        }}
        className="bg-pattern shadow-[0px_4px_75px_-5px_rgba(0,0,0,0.07)] relative overflow-hidden rounded-[10px] mobile:!w-full cursor-pointer"
        style={{
          height: height || "280px",
          width: width || "280px",
          borderTop: "1px inset #fff",
          borderLeft: "1px inset #fff",
        }}
      >
        {useSelect && (
          <div className="z-10 absolute right-3 top-3">
            <Checkbox
              checked={isChecked}
              value={`${nft?.token_id}-${nft?.serial_number}`}
              onChange={(event) => {
                if (onChange) {
                  onChange(event.target.checked);
                }
              }}
            />
          </div>
        )}
        <div className="inset-0 relative">
          <div className="flex">

            <img
              src={isNftClaim ? nft?.image : nft?.metadata?.image}
              className="object w-full h-full"
              alt="NFT"
              height={height}
              width={width}
              style={{
                height: isNftClaim ? "280px" : "280px", 
                objectFit: isNftClaim ? "contain" : "cover", 
              }}
            />
          </div>
          {!tab && (
            <div
              className="flex p-2 justify-between items-end font-inter absolute top-0 w-[100%] h-[100%]"
              style={{
                background: "rgb(0 0 0 / 20%)",
              }}
            >
              <div>
                <p>Spheraheads</p>
                <span className="text-[16px] font-semibold z-50">{isNftClaim ? nft?.name : nft?.metadata?.name}</span>
              </div>
              <div className="flex-col items-end justify-between">
                <button className="hover:bg-orange-hover h-8 p-1 rounded-[3px] text-orange hover:text-white">
                  <HeartIcon />
                </button>
                {action}
              </div>
            </div>
          )}
        </div>
      </div>
      {tab && <p>{nft.metadata.name}</p>}
    </div>
  );
};

export default NftItem;
