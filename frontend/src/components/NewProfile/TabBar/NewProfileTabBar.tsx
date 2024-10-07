import React, { useState } from "react";
import styles from "../styles.module.scss";
import MyCollection from "./Tabs/MyCollections";
import Offers from "./Tabs/Offers";
import Bids from "./Tabs/Bids";
import Favourites from "./Tabs/Favourites";
import Achievements from "./Tabs/Achievements";
import Activity from "./Tabs/Activity";
import { UserProfileType } from "@/types/user.type";


interface Tab {
    label: string;
    slug: string;
    component: React.ReactNode;
}
type Props = {
    userProfile: UserProfileType;
    isOwner?: boolean;
  };

  

const TabButton = ({
    label,
    active,
    setTab,
}: {
    label: string;
    setTab: () => void;
    active: boolean;
}) => {
    return (
        <button
            className={`min-w-[230px] text-[18px] font-bold uppercase px-[10px] rounded-full py-4 ${active ? "text-orange" : "text-white"} ${styles.tabBtn}`}
            style={{ zIndex: 0 }}
            onClick={setTab}
        >
            {label}
        </button>
    );
};

const NewProfileTabBar = ({ userProfile, isOwner }: Props) => {
    isOwner = true;
    

    const tabList: Tab[] = [
        { label: "My Collection", slug: "my-collection", component: <MyCollection userProfile={userProfile}/> },
        { label: "Offers", slug: "offers", component: <Offers /> },
        { label: "Bids", slug: "bids", component: <Bids /> },
        { label: "Favourites", slug: "favourites", component: <Favourites /> },
        { label: "Achievements", slug: "achievements", component: <Achievements /> },
        { label: "Activity", slug: "activity", component: <Activity /> },
    ];
    const [activeTab, setActiveTab] = useState<Tab>(tabList[0]);
    

    return (
        <div className={`bg-[rgb(25,25,25)] mt-[-20px] relative ${styles.profileTabs}`} >
            <div style={{ boxShadow: "0px 10px 15px 10px rgba(0, 0, 0, 1)", zIndex: 99999 }} className="absolute top-20 left-0 right-0"></div>
            <div className="w-full flex justify-center items-center gap-2 mt-10 bg-[rgb(25,25,25)]">
                {tabList.map((tab, index) => (
                    <TabButton
                        key={index}
                        label={tab.label}
                        setTab={() => setActiveTab(tab)}
                        active={activeTab.slug === tab.slug}
                    />
                ))}
            </div>
            <div className="mt-4">{activeTab.component}</div>
        </div>
    );
};

export default NewProfileTabBar;
