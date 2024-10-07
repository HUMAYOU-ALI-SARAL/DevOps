import React from "react";
import { useTranslate } from "@/providers/translate.provider";
import Faq from "@/components/Collection/Tabs/Overview/Faq";
import MintBlock from "./MintBlock";
import ClaimBlock from "./ClaimBlock";
import RecentBlock from "./RecentBlock";
import { NftCollection } from "@/types/blockchain.type";

interface IOverview {
    collection: NftCollection,
    urlID: string
};

const Overview = ({ collection, urlID }: IOverview) => {
    const { _t } = useTranslate();
    console.log("Overview page is calling.");

    return (
        <>
            {/* <MintBlock collection={collection} /> */}
            {/* <ClaimBlock /> */}
            <div className="bg-[#1c1c1c] min-h-[100px]">
                <RecentBlock collection={collection} url_ID={urlID} />
            </div>
            {/* <Faq />  */}
        </>
    )
};

export default Overview;