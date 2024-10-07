import React, { useState } from "react";
import styles from "../styles.module.scss";
import { useTranslate } from "@/providers/translate.provider";
import AllItems from "./Tabs/AllItems";
import Sphera from "./Tabs/Sphera";
import Collections from "./Tabs/Collections";
import Achievements from "./Tabs/Achievements";
import TransactionHistory from "./Tabs/TransactionHistory";
import Offers from "./Tabs/Offers";
import Bids from "./Tabs/Bids";
import Activity from "./Tabs/Activity";
import { UserProfileType } from "@/types/user.type";
import { useRouter } from "next/router";
import Slider from "@/components/Slider/Slider";
import Favourites from "@/components/User/ProfileTabs/Tabs/Favourite";


interface Tab {
  label: string;
  slug: string;
  component?: React.ReactNode;
}

const Tab = ({
  label,
  active,
  setTab,
  onMouseEnter,
  onMouseLeave,
}: {
  label: string;
  setTab: () => void;
  active: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) => {
  return (
    <h1
      className={`cursor-pointer font-blink font-extrabold pb-2 z-10`}
      style={!active ? {
        background: "#4D4D4D",
        border: "inset 4px solid #4444",
        width: "16%",
        display: "flex",
        justifyContent: "center",
        alignItems: "end",
        letterSpacing: '0.05px',
        gap: "50px",
        height: "50px",
        borderTop: "1px inset #fff",
        borderRadius: "35px 35px 0px 0px",
        boxShadow: "rgba(0, 0, 0, 0.7) 0px 20px 30px -12px inset",
        fontSize: "23px"
      } : {
        background: "#4D4D4D",
        border: "inset 4px solid #4444",
        width: "16%",
        display: "flex",
        justifyContent: "center",
        alignItems: "end",
        letterSpacing: '0.05px',
        gap: "50px",
        height: "50px",
        borderRadius: "35px 35px 0px 0px",
        boxShadow: "rgba(0, 0, 0, 0.7) 0px -5px 15px 1px inset,0px -5px 5px 4px rgba(255, 108, 0, 0.3)",
        fontSize: "23px",
        color: "#ff6c00",
      }}
      onClick={setTab}
      onMouseEnter={onMouseEnter} // Trigger hover state
      onMouseLeave={onMouseLeave} // Reset hover state
    >
      {label}
    </h1>
  );
};


type Props = {
  userProfile: UserProfileType;
  isOwner?: boolean;
};
const ProfileTabs = ({ userProfile, isOwner }: Props) => {
  const { _t } = useTranslate();
  const router = useRouter();
  const tabQuery = router.query.tab as string || null;
  const tabList: Tab[] = [
    {
      label: _t("MY COLLECTIONS"),
      slug: "all",
      component: <AllItems userProfile={userProfile} />,
    },
    {
      label: _t("OFFERS"),
      slug: "offers",
      component: <Bids userProfile={userProfile} isOwner={isOwner} />,
    },
    {
      label: _t("BIDS"),
      slug: "bids",
      component: <Offers userProfile={userProfile} isOwner={isOwner} />,
    },
    {
      label: _t("FAVOURITES"),
      slug: "favourite",
      component: <Favourites />,
    },
    {
      label: _t("Achievements"),
      slug: "achievements",
      component: <Achievements userProfile={userProfile} />,
    },
    {
      label: _t("Activity"),
      slug: "activity",
      component: <Activity />,
    },
  ];

  let activeTabIndex = 0;

  if (tabQuery) {
    const index = tabList.findIndex((tab) => tab.slug === tabQuery);
    if (index > 0) {
      activeTabIndex = index;
    }
  }

  const [activeTab, setActiveTab] = useState<Tab>(tabList[activeTabIndex]);
  const [hoveredTab, setHoveredTab] = useState<number | null>(null);

  return (
    <div className={`${styles.profileTabs ?? ""} flex-1`}>
      <div className="flex flex-col w-full">
        <div className="flex justify-between bg-[#1c1c1c]"
          style={{
            boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.8), 0 -2px 4px -2px rgba(0, 0, 0, 0.5)',
            padding: "80px 40px 40px 30px",
            borderRadius: "30px 30px 0 0"
          }}
        >
          {tabList.map((tab, index) => (
            <Tab
              setTab={index===0?() => setActiveTab(tab):()=>{}}
              key={index}
              label={hoveredTab === index && index!==0 ? "Comming Soon" : tab.label}  // Change label on hover
              active={activeTab.slug === tab.slug}
              onMouseEnter={() => setHoveredTab(index)}  // Handle mouse enter
              onMouseLeave={() => setHoveredTab(null)}   // Handle mouse leave
            />
          ))}
        </div>

        <div className="flex w-full h-full mt-[-40px]" >
          {activeTab?.component}
        </div>
      </div>
    </div>
  );
};


export default ProfileTabs;
