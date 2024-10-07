import React from "react";
import { useUser } from "@/providers/user.provider";
import UserLayout from "../layouts/user.layout";
import Header from "@/components/User/Header/Header";
import SearchSection from "./@search/page";
import CategoriesSection from "./@categories/page";
import HeroSliderSection from "./@hero-slider/page";
import RecentListingsSection from "./@recent-listings/page";
import Footer from "@/components/Marketplace/Footer";
import Subscribe from "@/components/Marketplace/Subscribe";
import SpotlightSection from './@spotlight/page';
import LegacypassSection from './@LegacypassSection/page';
import GuidesSection from './@GuidesSection/page';
import FeaturedCollectionSection from './@FeaturedCollectionSection/page';
import SliderSection from "./@slider/page";
import ExploreSection from "./@ExploreSection/page"
import TabSection from "./@TabSection/page";
import NewCollectionsSection from './@NewCollectionsSection/page'


const Marketplace = () => {
  const { userProfile } = useUser();

  return (
    <>
      {userProfile && (
        <UserLayout title="Marketplace">
          <div className="bg-[#1c1c1c]">
            <Header />
            <HeroSliderSection />
            {/* <div className="flex flex-col w-full mt-12 px-10 gap-12 items-center justify-center"> */}
            {/* <CategoriesSection /> */}
            {/* <SliderSection /> */}
            {/* <UpcomingCollectionsSection /> */}
            {/* <div className="flex items-center w-full justify-center flex-col max-w-[1200px]"> */}
            {/* <PhygitalGoodsSection /> */}
            {/* <span className="text-[50px] uppercase font-bold text-center">Coming soon</span> */}
            {/* <HotAuctionsSection /> */}
            {/* <RecentListingsSection /> */}
            {/* </div> */}
            {/* <Subscribe /> */}
            {/* </div> */}
            {/* <Featured /> */}
            <div className="flex flex-col w-full mt-12 gap-12 items-center justify-center mb-12">
              <TabSection />
              <SpotlightSection />
              <FeaturedCollectionSection />
              <SearchSection />
              <ExploreSection />
              <LegacypassSection />
              <NewCollectionsSection /> 
              <RecentListingsSection />
              <GuidesSection />
              <Subscribe />
            </div>
            <Footer />
          </div>
        </UserLayout>
      )}
    </>
  );
};

export default Marketplace;
