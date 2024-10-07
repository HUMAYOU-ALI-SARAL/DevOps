import MainContainer from "@/components/Auth/MainContainer";
import NewPassword from "@/components/Auth/forgetPassword/NewPassword";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSidePropsContext } from 'next/types';
import { useTranslation } from "next-i18next";

const ForgetPassword = () => {
    const { t } = useTranslation();
    return (
        <MainContainer
            pageTitle={t("common:welcome")}
            leftSideFirstHeader={{ text: t("Change Password") }}
            leftSideDescription={{ text: t("Please enter your new password.") }}
        >
            <NewPassword />
        </MainContainer>
    )
}

export default ForgetPassword;

export const getServerSideProps = async ({ locale = 'en' }: GetServerSidePropsContext) => ({
    props: {
        ...(await serverSideTranslations(locale, ['auth', 'common'])),
    },
});