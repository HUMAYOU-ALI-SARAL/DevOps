import React, { useState, useEffect } from 'react';
import { useGetUserByReferralCodeQuery } from '@/api/userApi';
import Button from "@/components/Common/Button";
import { useRouter } from 'next/router';
import Link from "next/link";
import styles from './styles.module.scss';
import { useTranslation } from 'next-i18next';

const InvitePage: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [referralCode, setReferralCode] = useState<string>('');
  const [submittedCode, setSubmittedCode] = useState<string>('');
  const { data, error, isLoading } = useGetUserByReferralCodeQuery(submittedCode, { skip: !submittedCode });

  useEffect(() => {
    if (error) {
      console.error('Failed to fetch user by referral code:', error);
    }
  }, [error]);

  const handleSubmit = () => {
    setSubmittedCode(referralCode);
  };

  return (
    <div className={`${styles.authForm} shadow rounded-lg`}>
      <p className="text-3xl py-3 text-left">{t("Invitation Code Validation")}</p>
      <div className={`${styles.paraLink}`}>
        <input
          type="text"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          placeholder="Enter referral code"
          className='p-2 rounded w-full'
        />
        <Link href="/auth/login" className="text-orange underline w-full flex justify-end pt-1">{t("auth:sign_in")}</Link>
        <p className={`${styles.paraLink}`}>
          {t("auth:by_clicking_the_button_you_agree")}{" "}
          <Link className="text-orange underline" href="">
            {t("auth:terms_of_service")}
          </Link>{" "} .
        </p>
      </div>
      <Button
        className="w-full mt-2 rounded"
        type="button"
        label={t("Check Code")}
        onClick={handleSubmit}
      />
      {isLoading && <div>Loading...</div>}
      {data && !error && (
        <div className="mt-4 p-4 border rounded bg-green-100">
          <p className="text-lg">{data.message}</p>
        </div>
      )}
      {error && (
        <div className="mt-4 p-4 border rounded bg-red-100">
          <p className="text-lg">No user found with this referral code</p>
        </div>
      )}
    </div>
  );
};

export default InvitePage;
