"use client";
import { useTranslate } from "@/providers/translate.provider";
import Image from "next/image";
import Link from "next/link";
import {
  DiscordFilledIcon,
  FacebookFilledIcon,
  InstagramFilledIcon,
  TelegramFilledIcon,
  TwitterFilledIcon,
} from "../Common/Icons";
import styles from './styles.module.scss';
import { FaXTwitter } from "react-icons/fa6";


const Footer = () => {
  const { _t } = useTranslate();

  return (
    <div className={` ${styles.footer} `}>
      <div className={`flex flex-col w-[60%] py-6 gap-8 px-10 m-auto font-abz mt-[-1px]`}>
        <div className="flex justify-between items-end font-extralight text-xl mobile:flex-wrap">
          <div className="flex flex-col">
            <Image alt="logo" src="/logo.png" width={60} height={48} className="my-2" />
            <span className="text-[14px] text-[#ADB1C2] font-thin">{_t("The digital collectibles ecosystem")}</span>
            <span className="text-[14px] text-[#ADB1C2] font-thin">{_t("providing new experiences for sports fans.")}</span>
          </div>
          <div className="flex gap-10">
            <div className="flex flex-col">
              <Link href="#" className="text-[14px] text-[#ADB1C2] font-thin">{_t("Privacy policy")}</Link>
              <Link href="#" className="text-[14px] text-[#ADB1C2] font-thin">{_t("Terms of service")}</Link>
            </div>
            <div className="flex flex-col">
              <Link href="#" className="text-[14px] text-[#ADB1C2] font-thin">{_t("About Us")}</Link>
              <Link href="#" className="text-[14px] text-[#ADB1C2] font-thin">{_t("Contact Us")}</Link>
            </div>
            <div className="flex flex-col">
              <Link href="#" className="text-[14px] text-[#ADB1C2] font-thin">{_t("News")}</Link>
              <Link href="#" className="text-[14px] text-[#ADB1C2] font-thin">{_t("FAQs")}</Link>
            </div>
          </div>
        </div>
        <div className="bg-white-50 h-[1px ] w-full border-t-2 border-white border-opacity-15"></div>
        <div className="flex w-full justify-between font-thin tablet:flex-wrap tablet:justify-start mobile:flex-wrap mobile:justify-start">
          <div className="flex text-[#ADB1C2]">© Sphera 2024. All rights reserved.</div>
          <div className="flex items-center gap-6 mobile:flex-wrap">
            <span className="text-[#ADB1C2]">Follow us</span>
            <Link href="https://www.facebook.com/spheraworld" target="_blank" rel="noopener noreferrer">
              <FacebookFilledIcon className="w-[30px]" />
            </Link>
            <Link href="https://x.com/spheraworld" target="_blank" rel="noopener noreferrer" className="bg-white rounded-full w-8 h-8 flex justify-center items-center">
              <FaXTwitter className="w-[30px]" color="#000"/>
            </Link>
            <Link href="https://www.instagram.com/sphera.world/" target="_blank" rel="noopener noreferrer">
              <InstagramFilledIcon className="w-[30px]" />
            </Link>
            <Link href="https://t.me/SpheraWorld_English" target="_blank" rel="noopener noreferrer">
              <TelegramFilledIcon className="w-[30px]" />
            </Link>
            <Link href="https://discord.com/invite/CwM2H5GUcR" target="_blank" rel="noopener noreferrer">
              <DiscordFilledIcon className="w-[30px]" />
            </Link>
          </div>
        </div>
      </div>
    </div>

  );
};
export default Footer;
