"use client";
import * as Yup from 'yup';
import { useSignupMutation, useCheckReferralCodeMutation } from "@/api/userApi";
import { useFormik } from "formik";
import { useAppDispatch } from "@/hooks/app";
import { setAuthToken } from "@/reducers/user.slice";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/navigation";
import { useState } from 'react';
import Button from "@/components/Common/Button";
import OtpInput from 'react-otp-input';

import styles from './styles.module.scss';

const SignUpForm = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [signup, { isLoading }] = useSignupMutation();
    const [checkReferralCode] = useCheckReferralCodeMutation();
    const [referralCodeMessage, setReferralCodeMessage] = useState<string | null>(null);
    const [otpCode, setOtpCode] = useState<string>('');
    const [isReferralCodeValid, setIsReferralCodeValid] = useState<boolean>(true);

    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .min(4, t("auth:too_short"))
            .max(50, t("auth:too_long"))
            .required(t("common:required")),
        password: Yup.string()
            .min(6, t("auth:must_be_longer_than_or_equal_to", { num: 6 }))
            .required(t("common:required")),
        email: Yup.string().email(t("auth:invalid_email")).required(t("common:required")),
    });

    const formik = useFormik({
        initialValues: {
            email: "",
            name: "",
            password: "",
            referralCode: "",
        },
        validationSchema,
        onSubmit: async (values) => {
            if (values.referralCode && !isReferralCodeValid) {
                // Prevent form submission if referral code is invalid
                return;
            }

            try {
                const response:any = await signup(values);
                if (response?.error) {
                    // Handle signup error
                    return;
                }
                dispatch(setAuthToken(response.data.jwtToken));
                router.push('/auth/verification');
            } catch (error) {
                console.log(error);
            }
        },
    });

    const checkReferralCodeAPI = async (code: string) => {
        try {
            const response:any = await checkReferralCode({ referralCode: code });
            setReferralCodeMessage(response?.data?.message);
            setIsReferralCodeValid(true);
        } catch (error:any) {
            console.log("error?.data?.message",error?.data?.message);
            setReferralCodeMessage(error?.data?.message || "Invalid referral code");
            setIsReferralCodeValid(false);
        }
    };

    const otpInputHandler = (value: string) => {
        setOtpCode(value);
        formik.setFieldValue('referralCode', value);
        if (value.length === 5) {
            checkReferralCodeAPI(value);
        }
    };

    return (
        <div className={`${styles.authForm} shadow rounded-lg`}>
            <span className="text-3xl py-3 text-left">{t("auth:sign_up")}</span>
            <form onSubmit={formik.handleSubmit}>
                <div className={`${styles.paraLink}`}>
                    <label htmlFor="name">{t("auth:name")}</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.name}
                        autoComplete="on"
                        className='focus:ring-orange-hover focus:border-orange-hover'
                    />
                    <div
                        className={`text-red-500 h-[24px] ${formik.errors.name && formik.touched.name ? "visible" : "invisible"}`}
                    >
                        {formik.errors.name}
                    </div>
                </div>
                <div className={`${styles.paraLink}`}>
                    <label htmlFor="email">{t("auth:email")}</label>
                    <input
                        type="text"
                        name="email"
                        id="email"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.email}
                        autoComplete="on"
                        className='focus:ring-orange-hover focus:border-orange-hover'
                    />
                    <div
                        className={`text-red-500 h-[24px] ${formik.errors.email && formik.touched.email ? "visible" : "invisible"}`}
                    >
                        {formik.errors.email}
                    </div>
                </div>
                <div className={`${styles.paraLink}`}>
                    <label htmlFor="password">{t("auth:password")}</label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.password}
                        autoComplete="on"
                        className='focus:ring-orange-hover focus:border-orange-hover'
                    />
                    <div
                        className={`text-red-500 h-[24px] ${formik.errors.password && formik.touched.password ? "visible" : "invisible"}`}
                    >
                        {formik.errors.password}
                    </div>
                </div>
                <div className={`${styles.paraLink}`}>
                    <label htmlFor="referralCode">{t("Referral Code (Optional)")}</label>
                    <OtpInput
                        value={otpCode}
                        onChange={otpInputHandler}
                        numInputs={5}
                        containerStyle="w-full justify-around"
                        renderInput={(props) => <input {...props} style={{ width: "38px", textAlign: 'center', marginTop: "10px" }} />}
                    />
                    <div
                        className={`text-green-500 h-[24px] ${referralCodeMessage ? "visible" : "invisible"}`}
                    >
                        {referralCodeMessage}
                    </div>
                </div>
                <p className={`${styles.paraLink}`}>{t("auth:by_clicking_the_button_you_agree")} <Link className="text-orange underline" href="#">{t("auth:terms_of_service")}</Link> .</p>
                <Button
                    disabled={formik.isSubmitting || isLoading}
                    isLoading={formik.isSubmitting || isLoading}
                    className="w-full rounded h-10 mt-2"
                    label={t("auth:sign_up")}
                    type="submit"
                />
            </form>
            <p className={`${styles.paraLink}`}>{t("auth:you_already_have_an_account")} <Link className="text-orange underline" href="/auth/login">{t("auth:log_in")}</Link></p>
        </div>
    );
}

export default SignUpForm;
