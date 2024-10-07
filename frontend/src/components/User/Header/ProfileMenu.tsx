"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LuClock4 as ClockIcon } from "react-icons/lu";
import { FiSettings as SettingsIcon } from "react-icons/fi";
import { FiLogOut as LogoutIcon } from "react-icons/fi";
import { useUser } from "@/providers/user.provider";
import RefreshIcon from "@/public/icons/refresh.png";
import ProfileAvatar from "@/public/profile_Img.png";
import styles from "../styles.module.scss";
import { numberWithCommas } from "@/utils/common";
import { useTranslate } from "@/providers/translate.provider";
import { BsCurrencyDollar as TopUpIcon } from "react-icons/bs";
import { FiRefreshCcw } from "react-icons/fi";
import { Button, Modal } from 'flowbite-react';
import { RxCross2 } from 'react-icons/rx';
import { Client, Hbar, TransferTransaction } from '@hashgraph/sdk';
import Language from "@/components/Common/Language";
import { CgProfile } from "react-icons/cg";

const menuItems = [
  {
    title: "Profile",
    url: "/profile",
    icon: <CgProfile size={16} />,
    classNames: "",
  },
  {
    title: "Transaction history",
    url: "/profile?tab=transactions",
    icon: <ClockIcon size={16} />,
    classNames: "",
  },
  {
    title: "Settings",
    url: "/profile?edit=true",
    icon: <SettingsIcon size={16} />,
    classNames: "",
  },
  {
    title: "Testnet Hbar Faucet",
    action: () => console.log("This is data."),
    icon: <FiRefreshCcw size={16} />,
    classNames: "",
  }
];

const DropDown = ({ isShowed, openModal }: { isShowed: boolean, openModal: () => void }) => {
  const { _t } = useTranslate();
  const [show, setShow] = useState<boolean>(false);
  const { logOut, setOpenMoonPay } = useUser();

  return (
    <div
      className={`mt-[-10px] max-w-[170px] overflow-hidden pb-2 pt-6 ml-[1px] ${styles.dropdown ?? ""} ${show || isShowed ? "visible" : "invisible"}`}
      style={{ zIndex: 1 }}
      onMouseOver={() => { setShow(true) }}
      onMouseLeave={() => { setShow(false) }}
    >
      <div className="overflow-hidden">
        {menuItems.map((value, index) => (
          value.url ? (
            <Link href={value.url} key={index} className="flex items-center hover:bg-neutral-600 text-[13px] p-2">
              {value.icon}
              <span className="ml-2">{value.title}</span>
            </Link>
          ) : (
            <div key={index} className="p-2 flex hover:bg-neutral-600 items-center cursor-pointer text-[13px]" onClick={() => value.title === "Testnet Hbar Faucet" ? openModal() : value.action?.()}>
              {value.icon}
              <span className="ml-2">{value.title}</span>
            </div>
          )
        ))}
        <div
          className="flex hover:bg-neutral-600 cursor-pointer text-[13px] p-2"
          onClick={() => { logOut() }}
        >
          <LogoutIcon size={16} color="#FF5E5E" />
          <span className="text-red-500 ml-2">{_t("Log out")}</span>
        </div>
      </div>
    </div>
  );
};

const ProfileMenu = () => {
  const { userProfile, accountBalance, refreshAccountBalance, isBalanceLoading } = useUser();
  const [show, setShow] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleAmountChange = (value: any) => {
    const numValue = Number(value);
    if (numValue <= 100) {
      setAmount(value);
    }
  };
  const hbarTransferHandler = async (amount: any) => {
    const accId = localStorage.getItem('walletAccount_id');

    if (accId) {
      const myAccountId = '0.0.3562965';
      const myPrivateKey = '302e020100300506032b657004220420b2597f0e0146e951fc93c5e9463b1d8469a25f84c44913ab3ea477c9cd6e75f7';

      // const myAccountId = '0.0.1184596';
      // const myPrivateKey = '3030020100300706052b8104000a042204206e667b2c873848ed96ac543e4214835fe3e30e3c59f7e9cc945275c617823617';

      const client = Client.forTestnet();
      client.setOperator(myAccountId, myPrivateKey);
      client.setDefaultMaxTransactionFee(new Hbar(100));
      client.setMaxQueryPayment(new Hbar(50));

      try {
        setLoading(true);
        await new TransferTransaction()
          .addHbarTransfer(myAccountId, Hbar.fromTinybars(`-${amount}00000000`))
          .addHbarTransfer(accId, Hbar.fromTinybars(`${amount}00000000`))
          .execute(client);

      } catch (error) {
        console.error('Transfer failed:', error);
      } finally {
        setLoading(false);
      }
    }
    closeModal();
  };


  return (
    <div>
      <div className={`flex items-center	gap-x-3 `} style={{ zIndex: 10 }}>
        <div
          className={`relative w-[200px] h-9 rounded-3xl flex items-center px-2 ${styles.shadow_top_bottom} bg-[#292929]`}
          style={{ fontSize: '14px', border: '2px solid #5f5f5f', zIndex: 10}}
          onMouseOver={() => { setShow(true) }}
          onMouseLeave={() => { setShow(false) }}
        >
          <div className="text-neutral-500 font-normal text-base ml-3 flex items-center justify-center">
            <span className="text-[#fff] opacity-60">{accountBalance?.hbarBalance && numberWithCommas(Math.round(accountBalance.hbarBalance * Math.pow(10, 2)) / Math.pow(10, 2))}</span>
            <Image
              className={`cursor-pointer ${isBalanceLoading && 'animate-spin '} `}
              onClick={() => refreshAccountBalance()}
              alt="refresh"
              src={RefreshIcon}
            />
            <span className="ml-1 text-[#fff] opacity-60">HBAR</span>
          </div>
          <Image
            alt="avatar"
            className="absolute -right-1 rounded-full border-[2px] border-[#9f9f9f] bg-[#000]"
            style={{ width: "42px", height: "42px" }}
            src={
              userProfile?.profileImgUrl
                ? process.env.NEXT_PUBLIC_BACKEND_URL + userProfile.profileImgUrl
                : ProfileAvatar.src
            }
            width={30} height={30} quality={100}
          />
        </div>
        <Language />
      </div>
      <DropDown isShowed={show} openModal={openModal} />

      <Modal show={showModal} className={`${styles.modalContainer}`}>
        <div className="p-5 flex flex-col text-white bg-[#000000e8] rounded-lg relative">
          <p className="text-center text-[30px] font-bold">Select amount of hbar to top up</p>
          <RxCross2
            size={30}
            onClick={closeModal}
            className="absolute top-5 right-5 cursor-pointer"
          />
          <input
            type="text"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="w-full mt-5 border-2 border-white bg-transparent rounded-md"
            style={{ border: '2px solid #fff' }}
          />
          <p className="mt-1">Max: 100 hbar</p>
          <div className="flex flex-row justify-center gap-6 mt-10">
            {['10', '50', '100'].map((amt) => (
              <button
                key={amt}
                onClick={() => handleAmountChange(amt)}
                className="py-2 px-4 bg-slate-500 rounded-md"
              >
                {amt} hbar
              </button>
            ))}
          </div>
          <div className="flex flex-row justify-center gap-6 mt-10">
            <Button
              onClick={() => hbarTransferHandler(amount)}
              className="rounded-[5px] bg-[orange] border-none h-[50px] text-white min-w-[270px]"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Top Up'}{' '}

            </Button>
          </div>
        </div>
      </Modal>
    </div>

  );
};

export default ProfileMenu;
