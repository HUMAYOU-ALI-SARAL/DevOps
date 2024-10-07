import React from "react";
import { useUser } from "@/providers/user.provider";
import UserLayout from "../layouts/user.layout";
import Header from "@/components/User/Header/Header";
import Featured from "@/components/Marketplace/Featured";
import Footer from "@/components/Marketplace/Footer";
import HeroSliderSection from "../marketplace/@hero-slider/page";
import AllNftsSection from "./@all-nfts/page";
import styles from "../allCollections/styles.module.scss";

const AllNfts = () => {
    const { userProfile } = useUser();

    return (
        <>
            {userProfile && (
                <UserLayout title="AllNfts">
                    <Header />
                    {/* <HeroSliderSection /> */}
                    <div className={`w-full`}>
                        <div className="w-full border-sp-gray-650">
                            <div className={`${styles.collections} flex flex-col items-center`}>
                                <h2 className='text-[55px] font-bold mt-[130px] text-[#FF7F2A]'>NFT Collections</h2>
                                <h3 className='text-[25px] w-[900px] text-center '>
                                    There are 500+ collections available in the market. Dive into the sphera world to see what amazing collection you will be joining today.</h3>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col w-full mt-12 p-10 gap-12 items-center justify-center mb-12">
                        {/* <span className="text-[50px] uppercase font-bold text-center mt-2">Nft Collections</span> */}
                        <AllNftsSection />
                    </div>
                    {/* <Featured /> */}
                    <Footer />
                </UserLayout>
            )}
        </>
    );
};

export default AllNfts;
