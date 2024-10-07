"use client";
import React, { useEffect, useState } from "react";
import Button from "@/components/Common/Button";
import { useTranslate } from "@/providers/translate.provider";
import { Tooltip } from 'react-tooltip';
import Modal from "@/components/Common/Modal";
import { useBladeWallet } from "@/providers/blade-wallet.provider";
import { toast } from "react-toastify";
import Input from "@/components/Common/Input";
import { useUser } from "@/providers/user.provider";
import { useNft } from "@/providers/nft.provider";
import { useCheckNftAllowanceMutation, useSendNftListingMutation } from "@/api/blockchainApi";
import DataPicker from "react-datepicker";
import { addMinutes } from "date-fns";
import { MAX_TRANSACTION_FEE, TRANSACTION_GAS } from "@/constants/app.constants";
import { useIncrease10PointsMutation } from '../../../api/userApi'; 
import "react-datepicker/dist/react-datepicker.css";

type Props = {
    isUpdate?: boolean;
};

const List = ({ isUpdate }: Props) => {

    const listMinTime = addMinutes(new Date(), 43200);
    const CalTime = addMinutes(new Date(), 5);

    const { _t } = useTranslate();
    const [checkNftAllowance] = useCheckNftAllowanceMutation();
    const [nftListing] = useSendNftListingMutation();
    const { giveAllowanceForNFT, listNFT, isLoading, tinyBarToHbar, hbarToTinyBar } = useBladeWallet();
    const { userProfile } = useUser();
    const { nft, reFetchNft, listedInfo } = useNft();
    const [ increase10Points ] = useIncrease10PointsMutation(); 

    const [openListModal, setOpenListModal] = useState<boolean>(false);
    const [openAllowanceModal, setOpenAllowanceModal] = useState<boolean>(false);
    const [openListAllowanceModal, setOpenListAllowanceModal] = useState<boolean>(false);

    const [amount, setAmount] = useState<number>(0);
    const [isAllowed, setIsAllowed] = useState<boolean>(false);
    const [endTime, setEndTime] = useState<Date | null>(listMinTime);
    let allowanceInfo=[{ tokenId: nft?.token_id!, serialNumber: nft?.serial_number! }]
    let listInfo=[{ tokenId: nft?.token_id!, serialNumber: nft?.serial_number!, priceHBAR: amount }]

    const allowHandler = async () => {
        try {
            setOpenAllowanceModal(false)
            setOpenListModal(true);
            await giveAllowanceForNFT(userProfile?.accountId!,allowanceInfo );
            toast.success(_t("Allowance success"));
            setIsAllowed(true);
        } catch (error: any) {
            toast.error(error?.message);
        }
    };

    const listHandler = async () => {
        if (endTime && endTime < new Date()) {
            toast.error(_t("Wrong listing end time"));
            return;
        }
        try {
            console.log("Nft going to List",listInfo);
            const res = await listNFT(listInfo);
            console.log("res",res);
            // await increase10Points();
            toast.success(_t("Success"));
            setOpenListModal(false);
            reFetchNft();
            nftListing({
                nfts: [nft!],
                price: hbarToTinyBar(amount),
                isListed: true,
                listingEndTimestamp: endTime?.getTime()!,
            });
            localStorage.setItem("Volume",String(hbarToTinyBar(amount)))
        } catch (error: any) {
            toast.error(error?.message);
        }
    };

    useEffect(() => {
        if (nft && userProfile) {
            checkNftAllowance({
                ownerId: userProfile.accountId,
                spenderId: process.env.NEXT_PUBLIC_MARKET_CONTRACT_ID!,
                tokenId: nft.token_id,
                serialNumber: nft.serial_number,
            })
                .unwrap()
                .then((response) => {
                    const { hasAllowance } = response;
                    setIsAllowed(hasAllowance);
                })
                .catch((error) => {
                    console.log(error)
                });
        }
    }, [nft, userProfile, checkNftAllowance]);

    useEffect(() => {
        if (listedInfo?.isListed) {
            setEndTime(new Date(listedInfo.listingEndTimestamp));
            setAmount(tinyBarToHbar(listedInfo.price, false) as number);
        }
    }, [listedInfo]);

    return (
        <>
            <Button
                type="button"
                className="w-full max-w-[436px] rounded-[5px] text-white h-[50px] list-button"
                label={isUpdate ? _t("Update") : _t("Sell")}
                onClick={() => {
                    setOpenListModal(true)
                }}
            />
            <Tooltip noArrow anchorSelect=".list-button" place="bottom">
                {isUpdate ? _t("Update listing settings") : _t("Sell")}
            </Tooltip>

            <Modal
                show={openListModal}
                onClose={() => {
                    setOpenListModal(true);
                }}
            >
                <div className="p-14 flex flex-col text-white">
                    <p className="text-[36px] font-semibold">{isUpdate ? _t("Update") : _t("Listing")}</p>
                    <p className="text-[30px] font-semibold py-8">{nft?.metadata.name}</p>
                    <div className="flex flex-col">
                        <label className="text-20 pb-4 " htmlFor="amount">{_t("Listing Price")}</label>
                        <Input
                            name="amount"
                            id="amount"
                            type="number"
                            placeholder={_t("Amount")}
                            value={String(amount)}
                            onChange={(event) => setAmount(Number(event.target.value))}
                        />
                    </div>
                    <div className="flex flex-col pt-8">
                        <label className="text-20 pb-4" htmlFor="dateEnd">{_t("Chose listing end")}</label>
                        <DataPicker
                            selected={endTime}
                            onChange={(date) => setEndTime(date)}
                            dateFormat="MMMM d, yyyy h:mm aa"
                            startDate={CalTime}
                            minDate={CalTime}
                            showTimeSelect
                            className="w-full bg-sp-gray-600 h-11 border border-none placeholder-neutral-500 text-white text-sm rounded-lg focus:ring-orange-hover focus:border-orange-hover py-2.5 px-4"
                        />
                    </div>
                    <div className="flex flex-col pt-20 gap-y-5">
                        {!isAllowed &&
                            <Button
                                onClick={() => {
                                    setOpenAllowanceModal(true);
                                    setOpenListModal(false);
                                }}
                                // disabled={isLoading || isAllowed}
                                className="rounded-[5px] h-[50px] text-white"
                                label={_t("Give Allowance")}
                            />
                        }

                        <Button
                            onClick={() => {
                                setOpenListAllowanceModal(true);
                                setOpenListModal(false);
                            }}
                            disabled={!isAllowed || isLoading}
                            className="rounded-[5px] h-[50px] text-white"
                            label={_t("List")}
                        />
                        <Button
                            onClick={() => setOpenListModal(false)}
                            className="rounded-[5px] h-[50px] text-white bg-red hover:bg-rose-700"
                            label={_t("Cancel")}
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                show={openAllowanceModal}
                onClose={() => {
                    setOpenAllowanceModal(true);
                }}
            >
                <div className="shadow-white p-14 flex flex-col text-white">
                    <div className="flex flex-col justify-center items-center w-[100%]">
                        <p className="w-[100%] text-center text-[22px] font-semibold text-white">Transaction Details</p>
                        <p className="w-[180px] rounded-full text-center text-[16px] text-orange bg-orange/10 py-3 mt-2">Give Allowance</p>
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


                    <div className="flex flex-row justify-between w-full gap-6 mt-10 max-w-[900px]">
                        <Button
                            onClick={() => {
                                setOpenAllowanceModal(false)
                                setOpenListModal(true)
                            }}
                            className="rounded-[5px] w-full h-[50px] text-white bg-transparent border hover:bg-red hover:border-red"
                            label={_t("Cancel")}
                        />
                        <Button
                            onClick={() => allowHandler()}
                            disabled={isLoading || isAllowed}
                            className="rounded-[5px] h-[50px] text-white min-w-[240px]"
                            label={_t("Confirm")}
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                show={openListAllowanceModal}
                onClose={() => {
                    setOpenListAllowanceModal(true);
                }}
            >
                <div className="shadow-white p-14 flex flex-col text-white">
                    <div className="flex flex-col justify-center items-center w-[100%]">
                        <p className="w-[100%] text-center text-[22px] font-semibold text-white">Transaction Details</p>
                        <p className="w-[180px] rounded-full text-center text-[16px] text-orange bg-orange/10 py-3 mt-2">List NFT</p>
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
                                
                            <p className="text-white/80 font-light text-[16px]">{tinyBarToHbar(BigInt(TRANSACTION_GAS*listInfo.length))}</p>
                            <p className="text-white/80 font-light text-[16px]">{tinyBarToHbar(BigInt(MAX_TRANSACTION_FEE))}</p>

                        </div>
                    </div>
                    <div className="w-full h-[1px] bg-sp-gray-700 mt-10"></div>


                    <div className="flex flex-row justify-between w-full gap-6 mt-10 max-w-[900px]">
                    <Button
                            onClick={() => {
                                setOpenListAllowanceModal(false)
                                setOpenListModal(true)
                            }}
                            className="rounded-[5px] w-full h-[50px] text-white bg-transparent border hover:bg-red hover:border-red"
                            label={_t("Cancel")}
                        />
                        <Button
                            onClick={() => listHandler()}
                            disabled={!isAllowed || isLoading}
                            className="rounded-[5px] h-[50px] text-white w-full"
                            label={_t("Confirm")}
                        />
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default List;