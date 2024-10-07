"use client";
import React, { useState } from "react";
import Button from "@/components/Common/Button";
import { useTranslate } from "@/providers/translate.provider";
import { Tooltip } from 'react-tooltip';
import Modal from "@/components/Common/Modal";
import { useBladeWallet } from "@/providers/blade-wallet.provider";
import { toast } from 'react-toastify';
import Input from "@/components/Common/Input";
import { useGetAccountIdByUserNameMutation } from "@/api/userApi";
import { useUser } from "@/providers/user.provider";
import { useNft } from "@/providers/nft.provider";
import { useCheckTokenAssociationMutation, useSendNftListingMutation } from "@/api/blockchainApi";
import { WALLET_REGEX } from "@/constants/app.constants";
import { MAX_TRANSACTION_FEE, TRANSACTION_GAS } from "@/constants/app.constants";

const Transfer = () => {
    const { _t } = useTranslate();

    const [openTransferModal, setOpenTransferModal] = useState<boolean>(false);
    const [openTransferDetailModal, setOpenTransferDetailModal] = useState<boolean>(false);

    const { transferNft, isLoading, associateTokens ,tinyBarToHbar} = useBladeWallet();
    const [recipientInput, setRecipientInput] = useState<string>("");
    const [nftListing] = useSendNftListingMutation();
    const [fetchUserAccountId, fetchStatus] = useGetAccountIdByUserNameMutation();
    const [checkTokenAssociated] = useCheckTokenAssociationMutation();
    const { userProfile } = useUser();
    const { nft, reFetchNft } = useNft();
    let tranferDetails=[{ serialNumber: nft?.serial_number!, tokenId: nft?.token_id! }]
    const checkUser = async () => {
        if (recipientInput.match(WALLET_REGEX)) {
            await transferHandler(recipientInput);
        } else {
            fetchUserAccountId(recipientInput).unwrap()
                .then(async (response) => {
                    const { accountId } = response;
                    await transferHandler(accountId);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    };

    const transferHandler = async (walletId: string) => {
        checkTokenAssociated({
            tokenId: nft?.token_id!,
            accountId: walletId
        })
            .unwrap()
            .then(async (response) => {
                const { isAssociated } = response;
                if (isAssociated) {
                    try {
                        await transferNft(userProfile?.accountId!, walletId, tranferDetails);
                        toast.success(_t("Success"));
                        setOpenTransferModal(false);
                        nftListing({
                            nfts: [nft!],
                            price: 0,
                            isListed: false,
                            listingEndTimestamp: 0,
                        });
                        reFetchNft();
                    } catch (error: any) {
                        toast.error(error?.message);
                    }
                } else {
                    toast.error(_t("The recipient cannot accept this NFT"))
                }

            })
            .catch((error) => {
                console.log(error);
            });

    };

    return (
        <>
            <Button
                type="button"
                className="w-full max-w-[436px] rounded-[5px] text-orange hover:text-white h-[50px] offer-button bg-transparent border border-orange"
                label={_t("Transfer")}
                onClick={() => {
                    setOpenTransferModal(true);
                }}
            />
            <Tooltip noArrow anchorSelect=".offer-button" place="bottom">
                {_t("Transfer this NFT")}
            </Tooltip>

            <Modal
                show={openTransferModal} 
                onClose={() => setOpenTransferModal(false)}
                width="w-[550px]" className="w-[550px] rounded-2xl"
            >
                <div className="p-10 flex flex-col text-white">
                    <p className="text-[24px] font-semibold">{_t("Transfer")}</p>
                    <label className="text-20 my-5" htmlFor="recipient">{_t("Recipient")}</label>
                    <Input
                        type="text"
                        name="recipient"
                        id="recipient"
                        placeholder={_t("Enter address or name")}
                        value={recipientInput}
                        onChange={(event) => setRecipientInput(event.target.value)}
                    />

                    <div className="flex flex-row items-center justify-end mt-10 gap-x-5">

                        <Button
                            onClick={() => setOpenTransferModal(false)}
                            className="rounded-[5px] w-1/3 h-[50px] text-white bg-transparent border hover:bg-red hover:border-red"
                            label={_t("Cancel")}
                        />
                        <Button
                            disabled={isLoading || fetchStatus.isLoading || !recipientInput}
                            onClick={() => {
                                setOpenTransferDetailModal(true);
                                setOpenTransferModal(false)
                            }}
                            className="rounded-[5px] w-1/3 h-[50px] text-white"
                            label={_t("Transfer")}
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                show={openTransferDetailModal}
                onClose={() => {
                    setOpenTransferDetailModal(true);
                }}
            >
                <div className="shadow-white p-14 flex flex-col text-white">
                    <div className="flex flex-col justify-center items-center w-[100%]">
                        <p className="w-[100%] text-center text-[22px] font-semibold text-white">Transaction Details</p>
                        <p className="w-[180px] rounded-full text-center text-[16px] text-orange bg-orange/10 py-3 mt-2">Transfer NFT</p>
                    </div>
                    <div className="w-full h-[1px] bg-sp-gray-700 mt-10"></div>
                    <div className="flex gap-2 justify-between items-center pt-10">
                        <div className="flex flex-col gap-3">
                        <p className="text-white/80 font-light text-[16px]">Wallet address:</p>
                            <p className="text-white/80 font-light text-[16px]">Contract Id:</p>
                            <p className="text-white/80 font-light text-[16px]">Token Id:</p>
                            <p className="text-white/80 font-light text-[16px]">Serial No:</p>
                            

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
                    

                        </div>
                    </div>
                    <div className="w-full h-[1px] bg-sp-gray-700 mt-10"></div>


                    <div className="flex flex-row justify-between w-full gap-6 mt-10 max-w-[900px]">
                        <Button
                            onClick={() => {
                                setOpenTransferDetailModal(false);
                                setOpenTransferModal(true)
                            }}
                            className="rounded-[5px] w-full h-[50px] text-white bg-transparent border hover:bg-red hover:border-red"
                            label={_t("Cancel")}
                        />
                        <Button
                            disabled={isLoading || fetchStatus.isLoading || !recipientInput}
                            onClick={() => checkUser()}
                            className="rounded-[5px] w-full h-[50px] text-white min-w-[240px]"
                            label={_t("Confirm")}
                        />

                    </div>
                </div>
            </Modal>
        </>
    );
};

export default Transfer;