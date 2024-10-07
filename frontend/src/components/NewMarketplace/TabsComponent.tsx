"use client";
import React, { useState } from "react";
import { useTranslate } from "@/providers/translate.provider";
import Recommended from "./@Tabs/Recommended";
import New from "./@Tabs/New";
import DroppingSoon from "./@Tabs/DroppingSoon";
import Wrapper from '@/components/Common/Wrapper'

const TabsComponent = () => {
  const { _t } = useTranslate();
  const [activeTab, setActiveTab] = useState<string>("recommended");

  const tabList = [
    {
      label: _t("Recommended"),
      slug: "recommended",
      content: <div><Recommended /></div>,
      clickable: true,
    },
    {
      label: _t("New"),
      slug: "new",
      content: <div><New /></div>,
      clickable: false,
    },
    {
      label: _t("Dropping Soon"),
      slug: "droppingSoon",
      content: <div><DroppingSoon /></div>,
      clickable: false,
    }
  ];

  return (
    <div>
      <div className="flex justify-start items-center gap-4 max-w-[100%]">
        {tabList.map((tab, index) => (
          <button
            key={index}
            className={`p-2 px-6 ${tab.clickable ? "bg-[#282828] text-[#fff] rounded-lg cursor-pointer" : "text-[#686868] cursor-default"}`}
            onClick={() => {
              if (tab.clickable) {
                setActiveTab(tab.slug);
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {tabList.map((tab) =>
          activeTab === tab.slug ? (
            <div key={tab.slug}>{tab.content}</div>
          ) : null
        )}
      </div>
    </div>
  );
};

export default TabsComponent;
