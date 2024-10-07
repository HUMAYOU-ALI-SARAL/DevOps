"use client";
import Image from "next/image";
import { format } from "date-fns";
import ImageUploading from "react-images-uploading";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { UserProfileType } from "@/types/user.type";
import { AccountBalanceType } from "@/types/blockchain.type";
import { CiCalendar as CalendarIcon } from "react-icons/ci";
import { FiCopy as CopyIcon } from "react-icons/fi";
import TwitterIcon from "@/public/icons/twitter.png";
import ProfileAvatar from "@/public/img/profile/default-avatar.png";
import DefaultBg from "@/public/img/profile/banner.jpg";
import { FiEdit2 as EditIcon } from "react-icons/fi";
import AchievOne from "@/public/img/achievements/logo-1.png";
import styles from "./styles.module.scss";
import { useUploadUserImageMutation } from "@/api/userApi";
import { useAppDispatch } from "@/hooks/app";
import { setUserProfile } from "@/reducers/user.slice";
import { useTranslate } from "@/providers/translate.provider";
import { numberWithCommas } from "@/utils/common";
import { BladeSDK } from "@bladelabs/blade-sdk.js";
import { useGetAccountBalanceMutation } from "@/api/blockchainApi";
import { AccountId, Client, ContractCallQuery, ContractFunctionParameters, Hbar, PrivateKey } from "@hashgraph/sdk";
import { TRANSACTION_GAS, MAX_TRANSACTION_FEE } from "@/constants/app.constants";
import { useBladeWallet } from "@/providers/blade-wallet.provider";
import { Button, Modal } from "flowbite-react";


const AccountInfo = ({ accountId }: { accountId: string }) => {
  const [hidden, setHidden] = useState<boolean>(true);
  const handleCopyAccountId = () => {
    navigator.clipboard.writeText(accountId)
      .then(() => { toast.success("Account address copied to clipboard"); })
      .catch((error) => { console.error("Failed to copy AccountID:", error); });
  };

  return (
    <div className="flex items-center font-extralight -px-10">
      <span>Account address</span>
      <span
        className="mx-2 text-orange underline cursor-pointer"
        onClick={() => { setHidden(!hidden) }}
      >
        {hidden ? "Show" : "Hide"}
      </span>
      <span style={{ lineHeight: "7px" }} className={`${hidden ? "" : "text-orange"}`} >
        {hidden ? "**********" : accountId}
      </span>
      <CopyIcon className="ml-2 cursor-pointer" onClick={() => { handleCopyAccountId(); }} />
    </div>
  );
};



type Props = {
  userProfile: UserProfileType;
  accountBalance: AccountBalanceType;
  isEdit?: boolean | undefined;
};



const ProfileBanner = ({ userProfile, accountBalance, isEdit }: Props) => {
  const [uploadImage, { isSuccess, data }] = useUploadUserImageMutation();
  const dispatch: any = useAppDispatch();
  const { _t } = useTranslate();
  const [balance, setBalance] = useState(0);
  const [image, setImage] = useState<string>("")
  const [symbol, setSymbol] = useState<string>("")
  const [Owner, setOwner] = useState<Boolean>()
  const { tinyBarToHbar } = useBladeWallet()
  const [isPopupOpen, setIsPopupOpen] = useState(true)


  const getNftImageAndName = async () => {
    const maxFee = Hbar.fromTinybars(MAX_TRANSACTION_FEE * 120)

    try {
      const operatorKey = PrivateKey.fromStringDer("3030020100300706052b8104000a0422042056a76bd58deabbb90a2c46c7217dc9c6705aed6f5e99352898cb22c2419d9202");
      const hederaClient = process.env.NEXT_PUBLIC_HEDERA_NETWORK === 'testnet'
        ? Client.forTestnet().setOperator(AccountId.fromString("0.0.3706195"), operatorKey)
        : Client.forMainnet().setOperator(AccountId.fromString("0.0.3706195"), operatorKey);
      const query = new ContractCallQuery()
        .setContractId("0.0.4256713")
        .setGas(TRANSACTION_GAS)
        .setMaxQueryPayment(maxFee)
        .setFunction("tokenImage");
      const contractCallResult = await query.execute(hederaClient);
      const message = contractCallResult.getString(0);
      const querySymbol = new ContractCallQuery()
        .setContractId("0.0.4256713")
        .setGas(TRANSACTION_GAS)
        .setMaxQueryPayment(maxFee)
        .setFunction("name");
      const contractCallResult1 = await querySymbol.execute(hederaClient);
      const message1 = contractCallResult1.getString(0);
      setImage(message)
      setSymbol(message1)
      localStorage.setItem("EarlyAdopterImage", message)
      localStorage.setItem("EarlyAdopterName", message1)
      console.log(symbol, image)
    } catch (error) {
      console.log(error)
    }
  }

  const getUserInfo = useCallback(async () => {
    const maxFee = Hbar.fromTinybars(MAX_TRANSACTION_FEE * 120)
    const operatorKey = PrivateKey.fromStringDer("3030020100300706052b8104000a0422042056a76bd58deabbb90a2c46c7217dc9c6705aed6f5e99352898cb22c2419d9202");
    console.log(operatorKey)
    const AccId = AccountId.fromString(userProfile.accountId).toSolidityAddress()
    const hederaClient = process.env.NEXT_PUBLIC_HEDERA_NETWORK === 'testnet'
      ? Client.forTestnet().setOperator(AccountId.fromString("0.0.3706195"), operatorKey)
      : Client.forMainnet().setOperator(AccountId.fromString("0.0.3706195"), operatorKey);
    const query = new ContractCallQuery()
      .setContractId("0.0.4256713")
      .setGas(TRANSACTION_GAS)
      .setMaxQueryPayment(maxFee)
      .setFunction("balanceOf",
        new ContractFunctionParameters().addAddress("0x" + AccId)
      );
    const contractCallResult = await query.execute(hederaClient);
    const message = contractCallResult.getUint256(0);
    console.log(Number(message), "this is message")
    Number(message) > 0 ? setOwner(true) : setOwner(false)
    localStorage.setItem("Owner", "true")
  }, [Owner])
  const getInfoOfUser = async () => {
    const Image = localStorage.getItem("EarlyAdopterImage")
    const Name = localStorage.getItem("EarlyAdopterName")
    if (Image && Name) {
      setImage(Image)
      setSymbol(Name)
    }
    else {
      await getUserInfo()
      if (Owner) {
        await getNftImageAndName()
      }
    }
  }
  useEffect(() => {
    getInfoOfUser()
  }, [Owner])

  useEffect(() => {
    const bladeSDK = new BladeSDK();
    bladeSDK.init("IX6IEUJLn4qqKWbbgQkAnArBzwbcNIQ4IYejRnEXEZSfzJ7eFLuqa5QKIvpZqmzn", "testnet", "spherawebsdk82673", "");

    const getBalance = async () => {
      const balance = await bladeSDK.getBalance("0.0.3120870");
      setBalance(balance.hbars)
    }
    getBalance();
  }, [])




  const handleImageUpload = async (imageList: any, name: string) => {
    let formData = new FormData();
    formData.append(name, imageList[0].file);
    await uploadImage(formData);
  };

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(setUserProfile(data));
      toast.success(_t("Success"));
    }
  }, [isSuccess, data]);

  return (
    <div className={`relative w-full ${styles.profileBanner}`}>
      <Modal
        show={isPopupOpen}
      >
        <div className="shadow-white p-5 flex flex-col text-white bg-[#353535] rounded-lg	">
          <div className="flex flex-col justify-center items-center">
            <div className="size-32 p-3 rounded-full bg-slate-400/20 flex justify-center">
              <Image className="w-[75px]" alt="achieve" src={"https://spheraworld-demo.dev.beejee.org/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-1.52cf0183.png&w=96&q=75"} width={75} height={75} />
            </div>
          </div>

          <div className="w-full h-[1px] bg-sp-gray-700 mt-10"></div>

          <div className="text-[white] text-center	">
            <h2 className=" text-2xl pt-3 font-bold	">Achievement earned!</h2>
            <h3 className=" text-lg px-5 pt-3">For being one of participants of testing you will be given a sphera ultra badge</h3>
          </div>
          <div className="flex flex-row justify-center w-full gap-6 mt-10 max-w-[100%]">

            <Button
              onClick={() => {
                setIsPopupOpen(false)
              }}
               className="rounded-[5px] bg-[orange] border-none h-[35px] text-white min-w-[170px] text-[30px] flex justify-center items-center"
              label={"Close"}
            />
          </div>
        </div>
      </Modal>
      <div className={`${styles.slider} relative`}>
        <Image
          alt="banner"
          src={userProfile?.bgImgUrl ? process.env.NEXT_PUBLIC_BACKEND_URL + userProfile.bgImgUrl : DefaultBg.src}
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: "100%", maxHeight: "725px" }}
          quality={100}
        />
        {isEdit && (
          <ImageUploading
            value={[]}
            onChange={(imageList) => {
              handleImageUpload(imageList, "bgImg");
            }}
            dataURLKey="data_url"
          >
            {({ onImageUpload }) => (
              <div
                onClick={onImageUpload}
                className="cursor-pointer z-10 absolute inset-y-2/3 right-5 rtl:left-5 w-12 h-12 rounded-full bg-white opacity-70 flex items-center justify-center"
              >
                <EditIcon stroke="#000" size={30} />
              </div>
            )}
          </ImageUploading>
        )}
        <div className="absolute w-full bottom-5">
          <div className="flex items-center w-full">
            <div className="relative ml-8">
              <div className="rounded-full w-60 h-60 tablet:w-52 tablet:h-52 mobile:w-28 mobile:h-28">
                <Image
                  alt="avatar"
                  src={userProfile?.profileImgUrl ? process.env.NEXT_PUBLIC_BACKEND_URL + userProfile.profileImgUrl : ProfileAvatar.src}
                  fill quality={100}
                  className="rounded-full"
                />
              </div>

              {isEdit && (
                <ImageUploading
                  value={[]}
                  onChange={(imageList) => {
                    handleImageUpload(imageList, "profileImg");
                  }}
                  dataURLKey="data_url"
                >
                  {({ onImageUpload }) => (
                    <div
                      onClick={onImageUpload}
                      className="cursor-pointer absolute bottom-0 right-7 rtl:left-7 w-12 h-12 rounded-full bg-white opacity-70 flex items-center justify-center"
                    >
                      <EditIcon stroke="#000" size={30} />
                    </div>
                  )}
                </ImageUploading>
              )}
            </div>

            <div className="flex items-start justify-between w-full px-10 flex-wrap">
              <div className="flex flex-col">
                <div className="flex items-start">
                  <span className="text-24 font-semibold pt-2">{`${userProfile?.firstName || ""} ${userProfile?.lastName || ""}`}</span>
                  <div className="items-center hidden">
                    <Image className="mx-2" alt="twitter" src={TwitterIcon} />
                    <div>
                      <span className="font-thin text-20 mr-1">Followers:</span>
                      <span className="text-orange text-26 font-light">42.0k</span>
                    </div>
                    <div className="ml-3">
                      <span className="font-thin text-20 mr-1">Following:</span>
                      <span className="text-orange text-26 font-light">
                        365
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`${styles.profileLinear}`}></span>
                <div className="mt-2 flex items-center">
                  <span className="text-orange text-14">
                    @{userProfile.username}
                  </span>
                  <CalendarIcon className="mx-2" />
                  <span className="font-thin">
                    {/* Joined {format(new Date(userProfile.createdAt), "qo LLL u")} */}
                  </span>
                </div>
                <div>
                  <AccountInfo accountId={userProfile.accountId} />
                </div>
                {userProfile.bio && (
                  <div className="flex mt-2">
                    <span>Bio:</span>
                    <span className="ml-2 font-extralight max-w-md">
                      {userProfile.bio}
                    </span>
                  </div>
                )}
              </div>
              {!isEdit && (
                <>
                  {Owner ? <div className="flex items-center flex-col">
                    <span className="font-thin text-20">Achievements:</span>
                    <div className="flex space-x-5 mt-2">
                      <Image className="w-[75px]" alt="achieve" src={image} width={75} height={75} />
                    </div>
                    <div className="pt-2">
                      <h2>{symbol}</h2>
                    </div>
                  </div> : ""}
                  <div className="flex flex-col font-abz">
                    <span className="text-20 font-abz">Account Balance:</span>
                    <span className="text-[35px] font-semibold">
                      ${accountBalance?.balanceInUSD}
                    </span>
                    <span className="text-30 font-medium text-sp-gray-100">
                      {accountBalance?.hbarBalance && numberWithCommas(Math.round(accountBalance.hbarBalance * Math.pow(10, 2)) / Math.pow(10, 2))}{" "}
                      HBAR
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfileBanner;
