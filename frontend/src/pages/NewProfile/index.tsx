// "use client"
import UserLayout from "@/pages/layouts/user.layout";
import Header from "@/components/User/Header/Header";
import NewProfileBanner from "@/components/NewProfile/NewProfileBanner";
import NewProfileTabBar from "@/components/NewProfile/TabBar/NewProfileTabBar";
import Footer from "@/components/User/Footer";
import { useGetAccountBalanceMutation } from "@/api/blockchainApi";
import { useUser } from "@/providers/user.provider";
import { useRouter } from "next/router";
import Loader from "@/components/Common/Loader";




const Index = () => {
    const { userProfile, accountBalance } = useUser();

    const [fetchAccountBalance, { isSuccess: balanceSuccess, data: balanceData }] = useGetAccountBalanceMutation();
    const router = useRouter();
    const isEdit = !!router.query.edit;

    // const refreshAccountBalance = async () => {
    //     if (userProfile?.accountId) {
    //         await fetchAccountBalance(userProfile.accountId);
    //     }
    // };


    return (
        <UserLayout title="New Profile">
            <div className="">
                <Header />
                {(userProfile)
                    ? (
                        <>
                            {/* <NewProfileBanner accountBalance={accountBalance!} userProfile={userProfile} isEdit={isEdit}/> */}
                            <NewProfileTabBar userProfile={userProfile} isOwner/>
                        </>
                    ) : (
                        <>
                            <Loader />
                        </>
                    )}
                <Footer bgColor={"bg-[rgb(25,25,25)]"} />
            </div>
        </UserLayout>
    )
}

export default Index