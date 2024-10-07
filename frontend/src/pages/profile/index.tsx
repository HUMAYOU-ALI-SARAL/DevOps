"use client";
import UserLayout from "@/pages/layouts/user.layout";
import Header from "@/components/User/Header/Header";
import Footer from "@/components/User/Footer";
import Settings from "@/components/User/Settings/Settings";
import ProfileBanner from "@/components/User/ProfileBanner";
import ProfileSidebar from "@/components/User/ProfileSidebar/ProfileSidebar";
import ProfileTabs from "@/components/User/ProfileTabs/ProfileTabs";
import Slider from "@/components/Slider/Slider";
import { useUser } from "@/providers/user.provider";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSidePropsContext } from "next/types";
import { useRouter } from "next/router";
import Loader from "@/components/Common/Loader";
import styles from "./styles.module.scss";
import { useGetAccountBalanceMutation } from "@/api/blockchainApi";
import { useUpdateUserReferralCountMutation } from "@/api/userApi";
import { useEffect } from "react";

export default function SettingsPage() {
  const { userProfile, accountBalance, refreshAccountBalance } = useUser();
  const router = useRouter();
  const isEdit = !!router.query.edit;

  const [fetchAccountBalance] = useGetAccountBalanceMutation();
  const [updateUserReferralCount, { isLoading, isSuccess, data }] = useUpdateUserReferralCountMutation();

  useEffect(() => {
    const walletAccountId = localStorage.getItem('walletAccount_id');

    if (!walletAccountId) {
      alert('Could not found private key. Please contact with Administrator!!!');
    } else if (userProfile && walletAccountId !== userProfile.accountId) {
      router.reload();
    }
  }, [userProfile, router]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshAccountBalance();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(intervalId);
  }, [refreshAccountBalance]);

  useEffect(() => {
    const walletAccountId = localStorage.getItem('walletAccount_id');
    if (!walletAccountId) {
      alert('Could not find private key. Please contact with Administrator!!!');
    } else if (userProfile && walletAccountId !== userProfile.accountId) {
      router.reload();
    }
  }, [userProfile, router]);

  useEffect(() => {
    if (userProfile?.usedReferralCode) {
      updateUserReferralCount({ usedReferralCode: userProfile.usedReferralCode });
    }
  }, [userProfile, updateUserReferralCount]);

  useEffect(() => {
    if (isSuccess && data) {
      console.log('API Response:', data.message);
    }
  }, [isSuccess, data]);


  return (
    <UserLayout title="Profile Setting">
      <Header />
      {userProfile ? (
        <>
          <ProfileBanner accountBalance={accountBalance} userProfile={userProfile} isEdit={isEdit} />
          <div className={styles.profileBg}>
            <div className="w-full" style={{ height: "1px" }}></div>
            {isEdit && <Settings />}
            <div className={styles.profileContent ?? ""}>
              {!isEdit && <ProfileTabs userProfile={userProfile} isOwner />}
            </div>
          </div>
        </>
      ) : (
        <Loader />
      )}
      <Footer />
    </UserLayout>
  );
}

export const getServerSideProps = async ({ locale = "en" }: GetServerSidePropsContext) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});
