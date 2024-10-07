import MainContainer from "@/components/Auth/MainContainer";
import LoginForm from "@/components/Auth/LoginForm";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSidePropsContext } from 'next/types';
import { useTranslation } from "next-i18next";
import { parseCookies } from 'nookies'; // Import the nookies library to handle cookies

const Login = () => {
    const { t } = useTranslation();
    return (
        <MainContainer
            pageTitle={t("common:welcome")}
            leftSideFirstHeader={{ text: t("auth:sign_in") }}
            leftSideDescription={{ text: t("auth:sign_in_to_sphera_world") }}
        >
            <LoginForm />
        </MainContainer>
    );
}

export default Login;

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const { locale = 'en' } = context;
    const cookies = parseCookies(context); // Parse the cookies from the context
    const authUser = cookies.test_auth_user;

    // Check if the test_auth_user cookie is set to true
    if (!authUser || authUser !== 'true') {
        // If not authenticated, redirect to the main route
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }

    // If authenticated, proceed to render the login page
    return {
        props: {
            ...(await serverSideTranslations(locale, ['auth', 'common'])),
        },
    };
};
