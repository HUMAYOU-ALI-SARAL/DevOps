"use client";
import React, { useState } from "react";
import Button from "@/components/Common/Button";
import { useTranslate } from "@/providers/translate.provider";
import { Tooltip } from 'react-tooltip';
import Modal from "@/components/Common/Modal";
import { useBladeWallet } from "@/providers/blade-wallet.provider";
import { toast } from 'react-toastify';
import { useNft } from "@/providers/nft.provider";
import { useUser } from "@/providers/user.provider";
import { useRouter } from "next/router";
import { MIRROR_NODE_REFRESH_TIME } from "@/constants/app.constants";
import { useSendNftListingMutation } from "@/api/blockchainApi";
import { MAX_TRANSACTION_FEE, TRANSACTION_GAS } from "@/constants/app.constants";

const Burn = () => {
    const { _t } = useTranslate();
    const router = useRouter();

    const [openBurnModal, setBurnOfferModal] = useState<boolean>(false);
    const { burnTokens, isLoading, tinyBarToHbar } = useBladeWallet();
    const [nftListing] = useSendNftListingMutation();
    const { nft, setIsLoading } = useNft();
    const { userProfile } = useUser();

    const burnHandler = async () => {
        try {
            console.log(nft?.token_id!, nft?.serial_number!, userProfile?.accountId!)
            await burnTokens(userProfile?.accountId!, [{ serialNumber: nft?.serial_number!, tokenId: nft?.token_id! }]);
            setBurnOfferModal(false);
            toast.success(_t("Success"));
            setIsLoading(true);
            nftListing({
                nfts: [nft!],
                price: 0,
                isListed: false,
                listingEndTimestamp: 0,
            });
            setTimeout(() => {
                router.push("/profile");
            }, MIRROR_NODE_REFRESH_TIME)
        } catch (error: any) {
            toast.error(error?.message);
        }
    };

    return (
        <>
            <Button
                type="button"
                className="w-full max-w-[436px] rounded-[5px] h-[50px] bg-transparent text-red border border-red hover:text-white burn-button"
                label={_t("Burn")}
                onClick={() => {
                    setBurnOfferModal(true);
                }}
            />
            <Tooltip noArrow anchorSelect=".burn-button" place="bottom">
                <p>{_t("Destroy this NFT.")}</p>
                <p className="text-red-600">{_t("Once you burn an NFT, you can't recover it")}</p>
            </Tooltip>

            <Modal
                show={openBurnModal}
                onClose={() => setBurnOfferModal(false)}
                width="w-[550px]" className="w-[550px] rounded-2xl"
            >
                <div className="p-10 flex flex-col text-white">
                    <div className="flex flex-col justify-center items-center w-[100%]">
                        <p className="w-[100%] text-center text-[22px] font-semibold text-white">Transaction Details</p>
                        <p className="w-[180px] rounded-full text-center text-[16px] text-orange bg-orange/10 py-3 mt-2">Burn NFT</p>
                    </div>
                    <div className="w-full h-[1px] bg-sp-gray-700 mt-10"></div>
                    <div className="flex gap-2 justify-between items-center pt-10">
                        <div className="flex flex-col gap-3">
                            <p className="text-white/80 font-light text-[16px]">Wallet address:</p>
                            <p className="text-white/80 font-light text-[16px]">Contract Id:</p>
                            <p className="text-white/80 font-light text-[16px]">Token Id:</p>
                            <p className="text-white/80 font-light text-[16px]">Serial No:</p>

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
                            <p className="text-white/80 font-light text-[16px]">{tinyBarToHbar(BigInt(MAX_TRANSACTION_FEE))}</p>

                        </div>
                    </div>
                    <div className="w-full h-[1px] bg-sp-gray-700 mt-10"></div>

                    {/* <p className="text-[24px] font-semibold">{_t("Burn NFT")}</p>
                    <p className="text-20 font-normal pt-2">{_t("Are you sure you want to burn NFT?")}</p> */}

                    <div className="flex flex-row items-center justify-end mt-20 gap-x-5">
                        <Button
                            onClick={() => setBurnOfferModal(false)}
                            className="rounded-[5px] w-full h-[50px] text-white bg-transparent border hover:bg-red hover:border-red"
                            label={_t("Cancel")}
                        />
                        <Button
                            disabled={isLoading}
                            onClick={() => burnHandler()}
                            className="rounded-[5px] w-full h-[50px] text-white"
                            label={_t("Confirm")}
                        />
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default Burn;