"use client";
import React, { useEffect, useState } from "react";
import Button from "@/components/Common/Button";
import { useTranslate } from "@/providers/translate.provider";
import { Tooltip } from 'react-tooltip';
import Modal from "@/components/Common/Modal";
import { useBladeWallet } from "@/providers/blade-wallet.provider";
import { toast } from 'react-toastify';
import { useNft } from "@/providers/nft.provider";
import { useUser } from "@/providers/user.provider";
import { useCheckTokenAssociationMutation, useSendNftDealMutation } from "@/api/blockchainApi";
import { MAX_TRANSACTION_FEE, TRANSACTION_GAS } from "@/constants/app.constants";
import { useIncrease200PointsMutation } from '../../../api/userApi'; // Import the mutation hook


const BuyNow = () => {
    const { _t } = useTranslate();
    const { userProfile, accountBalance, refreshAccountBalance } = useUser();
    const [openBuyModal, setBuyModal] = useState<boolean>(false);
    const { isLoading, addBid, associateTokens, hbarToTinyBar, tinyBarToHbar } = useBladeWallet();
    const { nft, reFetchNft, listedInfo } = useNft();
    const [isAssociated, setIsAssociated] = useState<boolean>(false);
    const [checkTokenAssociated] = useCheckTokenAssociationMutation();
    const [nftDeal] = useSendNftDealMutation();
    const [increase200Points] = useIncrease200PointsMutation(); 

    const nftPrice = listedInfo ? tinyBarToHbar(BigInt(listedInfo.price)) : ""

    const associatHandler = async () => {
        try {
            await associateTokens([nft?.token_id!], userProfile?.accountId!);
            toast.success(_t("Associate success"));
            setIsAssociated(true);
        } catch (error: any) {
            toast.error(error?.message);
        }
    };

    const buyHandler = async () => {
        if (hbarToTinyBar(accountBalance?.hbarBalance!) < listedInfo?.price!) {
            toast.error(_t("You don't have enough money to buy"));
            return;
        }
        try {
            const transactionId = await addBid(nft?.token_id!, nft?.serial_number!, listedInfo?.price!, true);
            setBuyModal(false);
            toast.success(_t("Success"));
            nftDeal({
                ownerId: nft?.owner?.accountId!,
                buyerId: userProfile?.accountId!,
                transactionId,
                price: listedInfo?.price!,
                tokenId: nft?.token_id!,
                serialNumber: nft?.serial_number!,
            });
            // Call the 200 points API after successful purchase
            await increase200Points();
            reFetchNft();
            refreshAccountBalance();
            localStorage.setItem("Volume", `-${listedInfo?.price}`)
        } catch (error: any) {
            toast.error(error?.message);
        }
    };

    useEffect(() => {
        if (nft && userProfile) {
            checkTokenAssociated({
                tokenId: nft.token_id,
                accountId: userProfile.accountId
            })
                .unwrap()
                .then((response) => {
                    const { isAssociated } = response;
                    setIsAssociated(isAssociated);
                })
                .catch((error) => {
                    console.log(error)
                });
        }
    }, [nft, userProfile, checkTokenAssociated]);

    return (
        <>
            <Button
                type="button"
                className="w-full max-w-[436px] rounded-[5px] h-[50px] buy-button text-white"
                label={_t("Buy now")}
                onClick={() => {
                    setBuyModal(true);
                }}
            />
            <Tooltip noArrow anchorSelect=".buy-button" place="bottom">
                <p className="text-14">{_t("Buy this item for the specified price now")}</p>
            </Tooltip>

            <Modal
                show={openBuyModal}
                onClose={() => setBuyModal(false)}
                width="w-[550px]" className="w-[550px] rounded-2xl"
            >
                <div className="p-10 flex flex-col text-white">
                    <div className="flex flex-col justify-center items-center w-[100%]">
                        <p className="w-[100%] text-center text-[22px] font-semibold text-white">Transaction Details</p>
                        <p className="w-[80px] rounded-full text-center text-[16px] text-orange py-1 mt-2">Buy NFT</p>
                    </div>
                    <div className="w-full h-[1px] bg-sp-gray-700 mt-10"></div>
                    <div className="flex gap-2 justify-between items-center pt-10">
                        <div className="flex flex-col gap-3">
                            <p className="text-white/80 font-light text-[16px]">Wallet address:</p>
                            <p className="text-white/80 font-light text-[16px]">Contract Id:</p>
                            <p className="text-white/80 font-light text-[16px]">Token Id:</p>
                            <p className="text-white/80 font-light text-[16px]">Serial No:</p>
                            <p className="text-white/80 font-light text-[16px]">Gas Fee::</p>
                            <p className="text-white/80 font-light text-[16px]">Max transaction Fee:</p>
                            <p className="text-white/80 font-light text-[16px]">Payable Amount:</p>


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
                            <p className="text-white/80 font-light text-[16px]">{nftPrice.toString()}</p>
                        </div>
                    </div>
                    <div className="w-full h-[1px] bg-sp-gray-700 mt-10"></div>

                    <div className="flex flex-row items-center justify-end mt-20 gap-x-5">
                        <Button
                            onClick={() => setBuyModal(false)}
                            className="rounded-[5px] w-1/3 h-[50px] text-white bg-transparent border hover:bg-red hover:border-red"
                            label={_t("Cancel")}

                        />
                        {!isAssociated &&
                            <Button
                                onClick={() => associatHandler()}
                                disabled={isLoading || isAssociated}
                                className="rounded-[5px] w-1/3 h-[50px] text-white whitespace-nowrap"
                                label={_t("Associate token")}
                            />
                        }
                        <Button
                            disabled={isLoading || !isAssociated}
                            onClick={() => buyHandler()}
                            className="rounded-[5px] w-1/3 h-[50px] text-white"
                            label={_t("Confirm")}
                        />
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default BuyNow;
