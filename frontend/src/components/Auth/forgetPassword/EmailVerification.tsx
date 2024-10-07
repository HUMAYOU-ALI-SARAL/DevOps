import React from 'react'
import styles from '../styles.module.scss'
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import Button from "@/components/Common/Button";



const EmailVerification = () => {
    const { t } = useTranslation();
    const router = useRouter();


    return (
        <div className={`${styles.authForm} shadow rounded-lg`}>
            <p className="text-3xl py-3 text-left">Email Verification</p>
            <div className={`${styles.paraLink}`}>
                <label htmlFor="Name">{t("auth:email")}</label>
                <input
                    type="text" name="email" id="email" autoComplete="on"
                    className="focus:ring-orange-hover focus:border-orange-hover"
                />
                <Link
                    href="/auth/login"
                    className="text-orange underline w-full flex justify-end pt-1"
                >
                    {t("auth:sign_in")}
                </Link>
                <p className={`${styles.paraLink}`}>
                    {t("auth:by_clicking_the_button_you_agree")}{" "}
                    <Link className="text-orange underline" href="">
                        {t("auth:terms_of_service")}
                    </Link>{" "}
                    .
                </p>
            </div>
            <Link className="text-orange underline" href="/auth/forgetPasswordOTP">
                <Button className="w-full mt-2 rounded" type="submit" label={t("Send Code")} />
            </Link>
        </div>
    )
}

export default EmailVerification