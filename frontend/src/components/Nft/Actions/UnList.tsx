"use client";
import React, { useState } from "react";
import Button from "@/components/Common/Button";
import { useTranslate } from "@/providers/translate.provider";
import { Tooltip } from 'react-tooltip';
import Modal from "@/components/Common/Modal";
import { useBladeWallet } from "@/providers/blade-wallet.provider";
import { toast } from "react-toastify";
import { useNft } from "@/providers/nft.provider";
import { useSendNftListingMutation } from "@/api/blockchainApi";
import { useUser } from "@/providers/user.provider";
import { MAX_TRANSACTION_FEE, TRANSACTION_GAS } from "@/constants/app.constants";

const UnList = ({price}:any) => {
    console.log(price)
    const {userProfile}=useUser()
    const { _t } = useTranslate();
    const { unlistNFT, isLoading,tinyBarToHbar } = useBladeWallet();
    const [nftListing] = useSendNftListingMutation();
    const { nft, reFetchNft } = useNft();

    const [openUnListModal, setOpenUnListModal] = useState<boolean>(false);
    const unListHandler = async () => {
        try {
            localStorage.setItem("Volume",String(-price))
            console.log(nft)
            await unlistNFT(nft?.token_id!, nft?.serial_number!);
            toast.success(_t("Success"));
            setOpenUnListModal(false);
            reFetchNft();
            console.log(nft?.price)
            console.log(nftListing)
            nftListing({
                nfts: [nft!],
                price: 0,
                isListed: false,
                listingEndTimestamp: 0,
            });
        } catch (error: any) {
            toast.error(error?.message);
        }
    };

    return (
        <>
            <Button
                type="button"
                className="w-full max-w-[436px] rounded-[5px] text-orange hover:text-white h-[50px] unlist-button bg-transparent border border-orange"
                label={_t("Remove listing")}
                onClick={() => {
                    setOpenUnListModal(true)
                }}
            />
            <Tooltip noArrow anchorSelect=".unlist-button" place="bottom">
                {_t("Remove listing")}
            </Tooltip>

            <Modal
                show={openUnListModal}
                onClose={() => {

                    setOpenUnListModal(true);
                }}
            >
                <div className="p-14 flex flex-col text-white">
                    <div className="flex flex-col justify-center items-center w-[100%]">
                        <p className="w-[100%] text-center text-[22px] font-semibold text-white">Transaction Details</p>
                        <p className="w-[180px] rounded-full text-center text-[16px] text-orange bg-orange/10 py-3 mt-2">Remove listing</p>
                    </div>
                    <div className="w-full h-[1px] bg-sp-gray-700 mt-10"></div>
                    <div className="flex gap-2 justify-between items-center pt-10">
                        <div className="flex flex-col gap-3">
                        <p className="text-white/80 font-light text-[16px]">Wallet address:</p>
                            <p className="text-white/80 font-light text-[16px]">Contract Id:</p>
                            <p className="text-white/80 font-light text-[16px]">Token Id:</p>
                            <p className="text-white/80 font-light text-[16px]">Serial No:</p>
                            <p className="text-white/80 font-light text-[16px]">Gas Fee:</p>
                            <p className="text-white/80 font-light text-[16px]">Max transaction Fee:</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <p className="text-white/80 font-light text-[16px]">{userProfile?.accountId}</p>
                            <p className="text-white/80 font-light text-[16px] flex items-center gap-3">
                                <img
                                    alt="image"
                                    className="w-[24px]"
                                    src="/haderaIcon.png"
                                />0.0.3418318</p>
                            <p className="text-white/80 font-light text-[16px] flex items-center gap-3">
                                <img
                                    alt="image"
                                    className="w-[24px]"
                                    src="/haderaIcon.png"
                                />{nft?.token_id}</p>
                                  <p className="text-white/80 font-light text-[16px] flex items-center gap-3">
                                <img
                                    alt="image"
                                    className="w-[24px]"
                                    src="/haderaIcon.png"
                                />{nft?.serial_number}</p>
                            <p className="text-white/80 font-light text-[16px]">{tinyBarToHbar(BigInt(TRANSACTION_GAS))}</p>
                            <p className="text-white/80 font-light text-[16px]">{tinyBarToHbar(BigInt(MAX_TRANSACTION_FEE))}</p>

                        </div>
                    </div>
                    <div className="w-full h-[1px] bg-sp-gray-700 mt-10"></div>


                    <div className="flex flex-row justify-between w-full gap-6 mt-10 max-w-[900px]">
                        <Button
                            onClick={() => setOpenUnListModal(false)}
                            className="rounded-[5px] w-full h-[50px] text-white bg-transparent border hover:bg-red hover:border-red"
                            label={_t("Cancel")}
                        />
                        <Button
                            onClick={() => unListHandler()}
                            disabled={isLoading}
                            className="rounded-[5px] h-[50px] text-white w-full"
                            label={_t("Confirm")}
                        />
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default UnList;