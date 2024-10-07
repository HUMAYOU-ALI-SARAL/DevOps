import MainContainer from "@/components/Auth/MainContainer";
import EmailOTPVerification from "@/components/Auth/forgetPassword/EmailOTPVerification";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSidePropsContext } from 'next/types';
import { useTranslation } from "next-i18next";

const Login = () => {
    const { t } = useTranslation();
    return (
        <MainContainer
            pageTitle={t("common:welcome")}
            leftSideFirstHeader={{ text: t("Verify OTP") }}
            leftSideDescription={{ text: t("Enter your OTP for verification.") }}
        >
            <EmailOTPVerification onDone={function (): void {
                throw new Error("Function not implemented.");
            } } />
        </MainContainer>
    )
}

export default Login;

export const getServerSideProps = async ({ locale = 'en' }: GetServerSidePropsContext) => ({
    props: {
        ...(await serverSideTranslations(locale, ['auth', 'common'])),
    },
});