import React from 'react';
import InvitePage from '@/components/Auth/InvitePage';
import MainContainer from "@/components/Auth/MainContainer";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSidePropsContext } from 'next/types';
import { useTranslation } from "next-i18next";

const Invite = () => {
    const { t } = useTranslation();
    return (
        <MainContainer
            pageTitle={t("common:welcome")}
            leftSideFirstHeader={{ text: t("Check Invite Code") }}
            leftSideDescription={{ text: t("Please enter your invite code and check validation.") }}
        >
           <InvitePage />
        </MainContainer>
    )
}

export default Invite;

export const getServerSideProps = async ({ locale = 'en' }: GetServerSidePropsContext) => ({
    props: {
        ...(await serverSideTranslations(locale, ['auth', 'common'])),
    },
});