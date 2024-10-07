"use client";
import { useTranslate } from "@/providers/translate.provider";
import { useRouter } from "next/router";
import React, { useState } from "react";
import Image from "next/image";
import { RiShareLine as ShareIcon } from "react-icons/ri";
import { LuEye as EyeIcon } from "react-icons/lu";
import Faq from "react-faq-component";
import { BsChevronCompactDown as ExpandIcon } from "react-icons/bs";
import DefaultImg from "@/public/solo-logo.png";
import SuperRareLabel from "../Common/SuperRareLabel";
import { InfoIcon } from "../Common/Icons";
import List from "./Actions/List";
import Offer from "./Actions/Offer";
import Details from "./InfoRows/Details";
import PriceHistory from "./InfoRows/PriceHistory";
import Offers from "./InfoRows/Offers";
import Activity from "./InfoRows/Activity";
import Transfer from "./Actions/Transfer";
import Link from "next/link";
import { useNft } from "@/providers/nft.provider";
import UnList from "./Actions/UnList";
import { useBladeWallet } from "@/providers/blade-wallet.provider";
import Burn from "./Actions/Burn";
import BuyNow from "./Actions/BuyNow";
import { IoCaretBackSharp } from "react-icons/io5";
// import ShareModal from './ShareModel'
const infoStyles = {
    bgColor: 'transparent',
    rowTitleColor: "white",
    rowTitleText: '15px',
    rowContentColor: 'grey',
    arrowColor: "#fff",
    rowContentPaddingLeft: '10px',
};

const infoConfig = {
    animate: true,
    openOnload: 0,
    expandIcon: <ExpandIcon size={24} />,
    collapseIcon: <ExpandIcon size={24} />,
};

const Attributes = ({ name, value }: { name: string, value: string }) => {
    return (
        <div className="px-6 w-1/2 py-4 rounded-[5px] max-w-[269px] border border-orange bg-sp-bg-orange-100 flex flex-col text-16 font-normal">
            <p className="text-orange">{name}</p>
            <p>{value}</p>
        </div>
    );
};

const NftOverview = () => {
    const router = useRouter();
    const { _t } = useTranslate();
    const { nft, listedInfo, userBidInfo } = useNft();
    const { tinyBarToHbar } = useBladeWallet();

    const infoData = {
        rows: [
            {
                title: `${_t("Details")}`,
                content: <Details />,
            },
            {
                title: `${_t("Price history")}`,
                content: <PriceHistory />,
            },
            {
                title: `${_t("Activity")}`,
                content: <Activity />
            },
            {
                title: `${_t("Offers")}`,
                content: <Offers />
            },
        ],
    };

    const attributes = [
        { label: "Background", value: "Transparent" },
        { label: "Head", value: "Football pattern" },
        { label: "Lips", value: "White" },
        { label: "Jersey", value: "Tunisia" },
        { label: "Head accessories", value: "Black Cowboy hat" },
        { label: "Face accessories", value: "Cool glasses" },
        { label: "Mouth accessories", value: "None" },
    ];
          console.log(nft?.metadata.attributes[0]?.trait_type,"Nft")
          const[isShareModal,setIsShareModal]=useState(false)
    return (
        <>
            <div className="border-t border-sp-gray bg-[#1c1c1c] relative pb-[100px]">
                {/* <ShareModal isModelOpen={isShareModal} /> */}
                {/* Background Image Section */}
                <div className="relative w-full h-[130vh] bg-cover bg-center"
                    style={{
                        backgroundImage: `url('${nft?.metadata?.image || nft?.metadata?.image}')`,
                        backgroundRepeat: 'no-repeat',
                    }}
                >
                    {/* Gradient Overlay */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: "linear-gradient(to top, rgba(28, 28, 28, 1) 30%, rgba(0, 0, 0, 0) 100%)",
                        }}
                    ></div>
                </div>

                {/* Content Section - Overlapping on top of the background image */}
                <div className="absolute top-16 w-full h-auto pt-10 px-12 flex ">
                    <div className="flex w-full max-w-[450px] flex-col">
                        <button
                            className="py-1 rounded-md text-[14px] flex items-center justify-center gap-1 font-thin text-white w-[100px]"
                            onClick={() => { router.back() }}
                            style={{ border: '1px solid white' }}
                        >
                            <IoCaretBackSharp className="mt-[-1px] ml-[-10px]" />
                            BACK
                        </button>
                        <div
                            className="w-full h-[470px] border rounded-[6px] border-sp-gray relative mt-6"
                            style={{ border: "1px solid #3D3D3D" }}
                        >
                            <Image
                                fill
                                className="rounded-[6px] object-cover"
                                src={nft?.metadata?.image || DefaultImg}
                                alt="image"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col w-full items-start pl-10 rtl:pr-10">
                        <div className=" h-[80vh] w-full flex flex-col justify-center items-center">
                            <div className="w-full h-auto flex flex-col justify-center items-start">
                                <div className="flex w-full items-center justify-between">
                                    <p className="font-semibold text-[36px]">{nft?.metadata?.name}</p>
                                    {/* <ShareIcon className="cursor-pointer" size={32} onClick={()=>{setIsShareModal(!isShareModal)}}/> */}
                                </div>
                                <Link
                                    className="text-18 text-orange py-1"
                                    href={`/collection/${nft?.token.token_id}?tab=overview`}
                                >
                                    {nft?.token.name}
                                </Link>
                                <div className="flex text-16 gap-x-2">
                                    <p>{_t("owned by")}</p>
                                    {nft?.owner?.id && (
                                        <Link href={nft?.youAreOwner ? '/profile' : `/profile/${nft.owner.accountId}`} >
                                            <span className="text-orange">{nft.owner?.username || nft.owner?.accountId}</span>
                                            {nft?.youAreOwner && <span className="text-orange pl-1 rtl:pr-1 ">{_t("(You)")}</span>}
                                        </Link>
                                    )}
                                </div>
                                <div className="my-[32px]">
                                    <SuperRareLabel />
                                </div>
                                <div className="flex items-center gap-x-1">
                                    <EyeIcon size={20} />
                                    <p className="text-16 font-light">21 {_t("views")}</p>
                                </div>
                            {listedInfo?.isListed &&
                                <div className="mt-2 text-20">
                                    <p>{_t("Price")}: {tinyBarToHbar(listedInfo.price)}</p>
                                </div>
                            }
                            {listedInfo?.isListed && userBidInfo?.active &&
                                <div className="mt-2 text-20">
                                    <p>{_t("Your offer")}: {tinyBarToHbar(userBidInfo.amount)}</p>
                                </div>
                            }
                            </div>

                            {nft?.youAreOwner
                                ? (
                                    <div className="flex w-full flex-col">
                                        <div className="flex w-full gap-6 mt-10 flex-wrap max-w-[900px]">
                                            {<List isUpdate={listedInfo?.isListed} />}
                                            <Transfer />
                                            {listedInfo?.isListed && <UnList price={listedInfo.price} />}
                                            <Burn />
                                        </div>
                                        <div className="flex items-center mt-2 gap-x-2">
                                            <InfoIcon />
                                            <p className="font-14 font-normal">{_t("Hover over buttons to see tooltips")}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex w-full gap-6 mt-10 flex-wrap">
                                        {listedInfo?.isListed ? (
                                            <>
                                                <BuyNow />
                                                <Offer isEdit={userBidInfo?.active} />
                                            </>
                                        ) : (
                                            <p className="text-20">{_t('Not listed yet')}</p>
                                        )}
                                    </div>
                                )}

                        </div>
                    </div>
                </div>

                {/* Rest of the content */}
                <div className="mt-[-400px]  px-12 flex">
                    <div className="flex flex-col mt-6 px-2 font-extralight text-sm min-w-[450px] z-50 ">
                        <p className="text-[15px] font-medium">Description</p>
                        {/* <p className="font-extralight">If you own this NFT, you&apos;ll gain from its perks.</p> */}
                        <div className="w-[100%] rounded-md p-3 mt-2 " style={{ border: '1px solid rgba(255, 127, 42, 1)', background: "#33261d" }}>
                            <p className="w-[400px]">{nft?.metadata.description}</p>
                        </div>
                        <p className="text-[15px] font-medium mt-4 mb-2">Attributes</p>
                        <div className="grid grid-cols-2 gap-4 bg-[#1c1c1c] rounded-lg">
                            {nft?.metadata.attributes.map((attribute, index) => (
                                <div key={index} className="w-full py-3 px-4 rounded-md bg-[#222223] text-center border border-[rgba(255, 127, 42, 1)] text-[#FF7F2A]" style={{ border: '1px solid rgba(255, 127, 42, 1)', background: "#33261d" }}>
                                    <p className="font-medium">{attribute.trait_type}</p>
                                    <p className="text-[#fff]">{attribute.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col w-full items-start pl-10 rtl:pr-10">
                        <div className="nft-info flex w-full flex-col px-12">
                            <Faq
                                data={infoData}
                                styles={infoStyles}
                                config={infoConfig}
                            />
                        </div>
                    </div>
                </div>

            </div>

        </>
    );
};

export default NftOverview;
