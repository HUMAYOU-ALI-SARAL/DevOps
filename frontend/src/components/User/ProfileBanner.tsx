"use client";
import Image from "next/image";
import { format } from "date-fns";
import ImageUploading from "react-images-uploading";
import Cropper from "react-easy-crop";
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { UserProfileType } from "@/types/user.type";
import { AccountBalanceType } from "@/types/blockchain.type";
import { CiCalendar as CalendarIcon } from "react-icons/ci";
import { FiCopy as CopyIcon } from "react-icons/fi";
import ProfileAvatar from "@/public/img/NewProfile/Person_Rectangle.png";
import DefaultBg from "@/public/img/NewProfile/banner.png"
import { FiEdit2 as EditIcon } from "react-icons/fi";
import styles from "./styles.module.scss";
import Ach1 from "@/public/img/achievements/logo-1.png"
import Ach2 from "@/public/img/achievements/logo-2.png"
import Ach3 from "@/public/img/achievements/logo-3.png"
import Ach4 from "@/public/img/achievements/logo-4.png"
import Ach5 from "@/public/img/achievements/logo-6.png"
import { useUploadUserImageMutation } from "@/api/userApi";
import { useAppDispatch } from "@/hooks/app";
import { setUserProfile } from "@/reducers/user.slice";
import { useTranslate } from "@/providers/translate.provider";
import { BladeSDK } from "@bladelabs/blade-sdk.js";
import { Button } from "flowbite-react";
import Modal from "@/components/Common/Modal";
import InternetIcon from "@/public/icons/internet.png";
import TwitterIcon from "@/public/icons/twitter.png";
import Instra from "@/public/icons/instra.png";
import { getCroppedImg } from "@/utils/cropImage";
import { RxCross2 } from "react-icons/rx";



const AccountInfo = ({ accountId }: { accountId: string }) => {
  const [hidden, setHidden] = useState<boolean>(true);
  const handleCopyAccountId = () => {
    navigator.clipboard.writeText(accountId)
      .then(() => { toast.success("Account address copied to clipboard"); })
      .catch((error) => { console.error("Failed to copy AccountID:", error); });
  };

  return (
    <div className="flex items-center font-extralight -px-10">
      <span>Wallet address</span>
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
  accountBalance: AccountBalanceType | null;
  isEdit?: boolean | undefined;
};

const ProfileBanner = ({ userProfile, isEdit }: Props) => {

  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState<File | null>(null);
  const [uploadImage, { isSuccess, data }] = useUploadUserImageMutation();
  const dispatch: any = useAppDispatch();
  const { _t } = useTranslate();
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false)
  const [showSpointModal, setShowSpointModal] = useState(false);

  const onCropComplete = useCallback((croppedAreaA: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageUpload = async (imageList: any, name: string) => {
    setImageSrc(URL.createObjectURL(imageList[0].file));
    setIsImagePopupOpen(true);
  };

  const showCroppedImage = useCallback(async () => {
    try {
      if (imageSrc && croppedAreaPixels) {
        const croppedImgFile = await getCroppedImg(imageSrc, croppedAreaPixels, "cropped-image.png");
        setCroppedImage(croppedImgFile);
        let formData = new FormData();
        formData.append("profileImg", croppedImgFile);
        await uploadImage(formData);
        setIsImagePopupOpen(false);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to crop the image.");
    }
  }, [imageSrc, croppedAreaPixels]);


  useEffect(() => {
    const bladeSDK = new BladeSDK();
    bladeSDK.init("IX6IEUJLn4qqKWbbgQkAnArBzwbcNIQ4IYejRnEXEZSfzJ7eFLuqa5QKIvpZqmzn", "testnet", "spherawebsdk82673", "");

    const getBalance = async () => {
      const balance = await bladeSDK.getBalance("0.0.3120870");
    }
    getBalance();
  }, [])

  useEffect(() => {
    const showPopup = localStorage.getItem("showFirstLoad");
    if (showPopup === "1") {
      setIsPopupOpen(true);
    }

    // Check if "showSpointModal" is true and display the Spoint modal
    const spointModal = localStorage.getItem("showSpointModal");
    if (spointModal === "true") {
      setShowSpointModal(true);
    }

  }, []);

  const handlePopupImageClose = () => {
    setIsImagePopupOpen(false);
    localStorage.removeItem("showFirstLoad");
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    localStorage.removeItem("showFirstLoad");
  }
  const handleSpointModalClose = () => {
    setShowSpointModal(false);
    localStorage.removeItem("showSpointModal");
    window.location.href = '/profile';
  };

  const handleBGImageUpload = async (imageList: any, name: string) => {
    console.log("imageList[0].file", name);
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
  const socialLinks = [
    { name: 'intrenet', icon: InternetIcon, url: '#' },
    { name: 'twitter', icon: TwitterIcon, url: '#' },
    { name: 'discord', icon: Instra, url: '#', width: 20, }
  ];



  return (
    <div className={`relative w-full ${styles.profileBanner} bg-[#1c1c1c]`}>
      <div className={`${styles.slider} relative`}>
        <Image
          alt="banner"
          src={userProfile?.bgImgUrl ? process.env.NEXT_PUBLIC_BACKEND_URL + userProfile.bgImgUrl : DefaultBg.src}
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: "100%", maxHeight: "725px", }}
          quality={100}
        />
        {isEdit && (
          <ImageUploading
            value={[]}
            onChange={(imageList) => {
              handleBGImageUpload(imageList, "bgImg");
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
            <div className="relative ml-8 w-[540px] h-[404px]" >
              <div className="rounded-full w-120 h-100 tablet:w-52 tablet:h-52 mobile:w-28 mobile:h-28" >
                <Image
                  alt="avatar"
                  src={userProfile?.profileImgUrl ? process.env.NEXT_PUBLIC_BACKEND_URL + userProfile.profileImgUrl : ProfileAvatar.src}
                  fill quality={100}
                  className="w-[90px] rounded-3xl overflow-hidden object-cover shadow-2xl"
                  style={{ borderRadius: "50px", overflow: "hidden", padding: '10px', objectPosition: "top" }}
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

            <div className="flex items-center justify-between w-full px-7 flex-wrap">
              <div className="flex flex-col">
                <div className="flex items-start">
                  <div className="flex items-center gap-2">
                    <span className="capitalize	text-[55px] font-semibold pt-2 font-abz">{`${userProfile?.firstName || ""} ${userProfile?.lastName || ""}`}</span>
                    {
                      userProfile?.links?.length > 0 &&
                      <>
                        {
                          userProfile.links[0]?.url &&
                          <a href={`https://x.com/${userProfile.links[0].url}`} target="_blank" rel="noopener noreferrer" className="ml-2">
                            <Image src={TwitterIcon} alt="Twitter" width={20} />
                          </a>
                        }
                        {
                          userProfile?.links[1]?.url !== "" &&
                          <a href={`https://www.instagram.com/${userProfile?.links[1]?.url}`} target="_blank" rel="noopener noreferrer" className="ml-2">
                            <Image src={Instra} alt={'Instagram'} width={26} />
                          </a>
                        }
                        {
                          userProfile?.links[2]?.url !== "" &&
                          <a href={`https://${userProfile?.links[2]?.url}`} target="_blank" rel="noopener noreferrer" className="ml-2">
                            <Image src={InternetIcon} alt={'Website Link'} width={20} />
                          </a>
                        }
                      </>
                    }
                  </div>
                </div>
                <div className="mt-2 flex items-center">
                  {userProfile.username ? (
                    <span className="text-orange text-16 font-abz">@{userProfile.username}</span>
                  ) :
                    <span className="text-orange text-16">@</span>

                  }
                  <CalendarIcon className="mx-2" />
                  <span className="font-thin font-abz">
                    Joined  {userProfile.createdAt && format(new Date(userProfile.createdAt), "qo LLL u")}
                  </span>
                </div>
                <div>
                  <AccountInfo accountId={userProfile.accountId} />
                </div>
                {userProfile.bio && (
                  <div className="flex mt-3 w-[500px]">
                    <span className="font-abz">Bio:</span>
                    <p className="ml-2 font-extralight min-w-400px whitespace-normal font-abz" style={{ width: "500px", whiteSpace: "wrap", overflow: "hidden", height: "100%" }}>{`${userProfile.bio}`}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {
        !isEdit && (
          <div className={styles.Achievments}>
            <div className="p-10">
              <h2 className="text-[20px] font-extrabold font-abz uppercase">Achievements</h2>
              <div className="flex items gap-8">
                <div className="flex space-x-5 mt-2">
                  <Image className="w-[80px] filter grayscale" alt="achieve" src={Ach1} width={80} height={80} />
                </div>
                <div className="flex space-x-5 mt-2">
                  <Image className="w-[80px]" alt="achieve" src={Ach2} width={80} height={80} />
                </div>
                <div className="flex space-x-5 mt-2">
                  <Image className="w-[80px] filter grayscale" alt="achieve" src={Ach3} width={80} height={80} />
                </div>
                <div className="flex space-x-5 mt-2">
                  <Image className="w-[80px] filter grayscale" alt="achieve" src={Ach4} width={80} height={80} />
                </div>
                <div className="flex space-x-5 mt-2">
                  <Image className="w-[80px] h-[80px] filter grayscale" alt="achieve" src={Ach5} width={80} height={80} />
                </div>
              </div>
            </div>
            <div className={styles.tradeInfo}>
              <div>
                <p className="text-[#969696] text-[16px] font-semibold font-abz">
                  TOTAL<br />COLLECTIBLES
                </p>
                <p className="text-[#FF6C00] text-[28px] font-bold font-abz">750</p>
              </div>
              <div>
                <p className="text-[#969696] text-[16px] font-semibold font-abz">
                  TOTAL <br />LISTED
                </p>
                <p className="text-[#FF6C00] text-[28px] font-bold font-abz">14</p>
              </div>
              <div>
                <p className="text-[#969696] text-[16px] font-semibold font-abz">
                  TRADE <br /> VOLUME
                </p>
                <p className="text-[#FF6C00] text-[28px] font-bold font-abz">1.7M</p>
              </div>
              <div>
                <p className="text-[#969696] text-[16px] font-semibold font-abz">
                  TOTAL <br /> ACHIEVEMENTS
                </p>
                <p className="text-[#FF6C00] text-[28px] font-bold font-abz">86</p>
              </div>
            </div>

          </div>
        )
      }


      {/* Models  */}
      <Modal show={isPopupOpen} onClose={handlePopupClose}>
        <div className="shadow-white p-5 flex flex-col text-white bg-[#353535] rounded-lg	">
          <div className="flex flex-col justify-center items-center">
            <div className="size-32 p-3 rounded-full bg-slate-400/20 flex justify-center">
              <Image className="w-[90px]" alt="achieve" src={"https://spheraworld-demo.dev.beejee.org/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-1.52cf0183.png&w=96&q=75"} width={75} height={75} />
            </div>
          </div>

          <div className="w-full h-[2px] bg-sp-gray-700 mt-10"></div>

          <div className="text-[white] text-center	">
            <h2 className=" text-2xl pt-3 font-bold	">Achievement earned!</h2>
            <h3 className=" text-lg px-5 pt-3">For being one of participants of testing you will be given a sphera ultra badge</h3>
          </div>
          <div className="flex flex-row justify-center w-full gap-6 mt-10 max-w-[100%]">
            <Button
              onClick={handlePopupClose}
              className="rounded-[5px] bg-[orange] border-none h-[35px] text-white min-w-[170px] text-[30px] flex justify-center items-center"
              label="Close" />
          </div>
        </div>
      </Modal>
      {/* Recharge Account  */}
      <Modal show={isImagePopupOpen} onClose={handlePopupImageClose}>
        <div className="shadow-white p-5 flex flex-col text-white bg-[#353535] rounded-lg items-center justify-center w-full relative">
          <div className="absolute top-1 right-1 cursor-pointer p-2 " >
            <RxCross2 />
          </div>
          <h2 className="text-xl font-semibold">Set your profile image</h2>
          {imageSrc && (
            <div className="crop-container relative w-full h-96 mt-4">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
          )}
          <Button
            onClick={showCroppedImage}
            className="mt-4 bg-orange text-white"
          >
            Upload Profile Image
          </Button>
        </div>
      </Modal>

      <Modal show={showSpointModal} onClose={handleSpointModalClose} width="w-[550px]" className="w-[550px] rounded-2xl">
        <div
          className="w-full shadow-white p-5 flex flex-col text-white bg-[#222223] items-center justify-center py-12 ] rounded-3xl"
          style={{
            backgroundImage: "url('/img/patterns/sPointModalShahow.png')", // Replace with your image path
            backgroundSize: "130%", // Zoom the image to 80% of its original size
            backgroundPosition: "top left", // Position the background at the top-left corner
            backgroundRepeat: "no-repeat", // Prevent the background from repeating
            backgroundColor: "#222223", // Fallback color if the image doesn't load
          }}>
          <h2 className="text-2xl font-thin">Daily login spoints bonus</h2>
          <h2 style={{ textShadow: "-1px 3px 5px #05EE54", color: "#05EE54", fontSize: '60px', fontWeight: "600", margin: "20px 0" }}>+10</h2>
          <button onClick={handleSpointModalClose} className="mt-5 p-2 px-8 bg-orange text-black rounded-lg">
            <p className="text-[20px] font-bold">Claim reward</p>
          </button>
        </div>
      </Modal>

    </div>
  );
};
export default ProfileBanner;
