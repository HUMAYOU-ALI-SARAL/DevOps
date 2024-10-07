"use client"
import Button from "@/components/Common/Button";
import OtpInput from 'react-otp-input';
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { useOtpVerifyMutation, useOtpResendEmailMutation, useGetProfileMutation } from "@/api/userApi";
import { logout, setUserProfile } from "@/reducers/user.slice";
import { setIsVerified } from "@/reducers/user.slice";
import { useAppDispatch } from "@/hooks/app";
import { toast } from 'react-toastify';
import styles from '../styles.module.scss';
import { useRouter } from "next/router";
import Link from "next/link";


type Props = {
    onDone: () => void;
};


const otpLength = 6;


const EmailOTPVerification = ({ onDone }: Props) => {
    const router = useRouter();
    const [otpCode, setOtpCode] = useState('');
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const [otpVerify, { isSuccess: verifySuccess, isLoading: verifyLoading }] = useOtpVerifyMutation();
    const [otpResendEmail, { isSuccess: resendSuccess, isLoading: resendLoading }] = useOtpResendEmailMutation();
    const [getProfile, { isSuccess: profileSuccess }] = useGetProfileMutation();

    const logOut = () => {
        dispatch(logout());
        router.push('/auth/login');
    };

    const otpInputHandler = async (value: string) => {
        setOtpCode(value);
        if (value.length === otpLength) {
            await otpVerify({ otp: value });
        }
    };

    const resendEmailHandler = async () => {
        await otpResendEmail({});
    };

    const getUserProfileHandler = async () => {
        await getProfile({}).then((data) => { dispatch(setUserProfile(data)) });
    };

    useEffect(() => {
        if (profileSuccess) {
            onDone();
        }
        if (verifySuccess) {
            dispatch(setIsVerified(true));
            getUserProfileHandler();
        }
        if (resendSuccess) {
            toast.success("Email sent");
        }
    }, [verifySuccess, resendSuccess, profileSuccess]);

    return (
        <div className={`${styles.authForm} shadow rounded-lg`}>
            <p className="text-3xl py-3 text-left">{t("auth:verify")}</p>
            <form>
                <p className={`${styles.paraLink} font-inter`}>{t("auth:enter_the_code_you_have_received")}</p>
                <div className="flex my-7 justify-center">
                    <OtpInput
                        value={otpCode}
                        onChange={otpInputHandler}
                        numInputs={otpLength}
                        containerStyle="w-full justify-around"
                        renderInput={(props) => <input {...props} style={{ width: "38px", textAlign: 'center' }} required
                        />}
                    />
                </div>
                <p className={`${styles.paraLink} font-inter w-72`}>{t("auth:did_not_receive_the_email")}</p>
                <div className="flex items-center justify-start gap-2">
                    <Button
                        type="button"
                        className="mt-2 flex px-4 rounded font-extralight"
                        // disabled={resendLoading || verifyLoading}
                        // onClick={() => { resendEmailHandler() }} 
                        label={t("auth:resend_email")} />
                    <Link href="/auth/newPassword">
                        <Button
                            type="button"
                            className="mt-2 px-8 flex rounded font-extralight"
                            // disabled={resendLoading || verifyLoading}
                            // onClick={() => { resendEmailHandler() }} 
                            label={t("auth:Verify")} />
                    </Link>
                </div>
            </form>

            <p className={`text-left text-16 text-orange cursor-pointer`} onClick={() => logOut()}>
                {t("Change Forgot Password method")}
            </p>
        </div>
    )
}

export default EmailOTPVerification;