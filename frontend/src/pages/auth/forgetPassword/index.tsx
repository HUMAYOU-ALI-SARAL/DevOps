import MainContainer from "@/components/Auth/MainContainer";
import EmailVerification from "@/components/Auth/forgetPassword/EmailVerification";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSidePropsContext } from 'next/types';
import { useTranslation } from "next-i18next";

const ForgetPassword = () => {
    const { t } = useTranslation();
    return (
        <MainContainer
            pageTitle={t("common:welcome")}
            leftSideFirstHeader={{ text: t("Forgot Password") }}
            leftSideDescription={{ text: t("common:enter_email_to_reset_password") }}
        >
            <EmailVerification />
        </MainContainer>
    )
}

export default ForgetPassword;

export const getServerSideProps = async ({ locale = 'en' }: GetServerSidePropsContext) => ({
    props: {
        ...(await serverSideTranslations(locale, ['auth', 'common'])),
    },
});