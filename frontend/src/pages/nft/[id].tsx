"use client"
import UserLayout from "@/pages/layouts/user.layout";
import Header from "@/components/User/Header/Header";
import Footer from "@/components/Marketplace/Footer";
import NftOverview from "@/components/Nft/NftOverview";
import NftProvider from "@/providers/nft.provider";
import React from "react";

const NftPage = () => {
    return (
        <UserLayout title="Sphera Marketplace">
            <Header />
            <NftProvider>
                <NftOverview />
            </NftProvider>
            <Footer />
        </UserLayout>
    );
};

export default NftPage;