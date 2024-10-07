import { Carousel } from "react-responsive-carousel";
import ArabicSlide from "@/public/img/slider/side-bg2.png";
import HeadStarterSlide from "@/public/img/slider/slide-bg-arabic.png";
import SpheraHeadsSlide from "@/public/img/slider/slide-bg1.png";
import HeadStarterLogo from "@/public/img/slider/headstarter.png";
import { MdOutlineKeyboardArrowLeft as ArrowLeftIcon } from "react-icons/md";
import { MdOutlineKeyboardArrowRight as ArrowRightIcon } from "react-icons/md";
import { useTranslate } from "@/providers/translate.provider";
import styles from "./styles.module.scss";
import Button from "../Common/Button";
import Image from "next/image";

const Arrow = ({ left, onClick }: { left?: boolean; onClick: () => void }) => {
  return (
    <button
      className={`
                rounded-full w-12 h-12 bg-sp-gray flex items-center justify-center 
                absolute z-10 cursor-pointer opacity-80 ${left ? "left-5 rtl:right-5" : "right-5 rtl:left-5"
        }
                `}
      style={{ bottom: "45%" }}
    >
      {left ? (
        <ArrowLeftIcon onClick={onClick} size={34} />
      ) : (
        <ArrowRightIcon onClick={onClick} size={34} />
      )}
    </button>
  );
};

const Slider = () => {
  const { _t } = useTranslate();
  return (
      <Carousel
        autoPlay={true}
        infiniteLoop={true}
        interval={10000}
        showIndicators={false}
        showThumbs={false}
        showStatus={false}
        renderArrowPrev={(clickHandler) => <Arrow onClick={clickHandler} left />}
        renderArrowNext={(clickHandler) => <Arrow onClick={clickHandler} />}
      >
        <div className={`${styles.slider} relative`} >
          <Image alt="slide" src={ArabicSlide} />
          <div
            className={`${styles.border} absolute bottom-6 py-2 px-14 font-actor`}
            style={{ left: "6%" }}
          >
            <p className="text-5xl">{_t("Sphera Marketplace")}</p>
            <p className="text-2xl">{_t("COMING SOON")}</p>
          </div>
        </div>

        
        <div className={`${styles.slider} w-full h-full flex items-center justify-center`}>
          <Image alt="slide" src={SpheraHeadsSlide} fill className="-z-10" />
          <div className="flex flex-col max-w-2xl items-start text-start">
            <p className="text-50 font-abz tracking-tighter mb-6 text-white">
              {_t("SpheraHeads: Genesis Edition")}
            </p>
            <p className="font-normal mb-5 text-white">
              {_t("Each digital collectible/NFT is unique and randomly generated for Sphera's early subscribers, tapping into a userbase of 30M+ football fans." )}
            </p>
            <p className="font-normal pr-10 rtl:pl-10 text-white">
              {_t("Claim your sports avatar for FREE and show support for your favorite team and interact with other fans on the Sphera platform.")}
            </p>
            <Button
              className="font-abz text-white rounded w-52 mt-10"
              label={_t("Claim Now")}
            />
          </div>
        </div>


        <div className="w-full h-full flex items-end justify-center">
          <Image alt="slide" src={HeadStarterSlide} fill />
          <div className="relative">
            <div className={`${styles.border} font-actor py-2 px-14 mb-2`}>
              <p className="text-40 mobile:text-20 tablet:text-30 font-light">
                {_t("WIN SIGNED EXCLUSIVE FOOTBALL JERSEYS")}
              </p>
              <p className="text-xl mobile:text-base tablet:text-lg">
                {_t(
                  "JOIN OUR PLATFORM LAUNCH WITH HEADSTARTER TO BE AUTOMATICALLY ENTERED"
                )}
              </p>
              <p className="text-xl mobile:text-base tablet:text-lg">
                {_t(
                  "TO WIN SIGNED RONALDO, BENZEMA & NEYMAR JR FOOTBALL JERSEYS!"
                )}
              </p>
            </div>
            <p className="mb-5 text-12 font-actor">
              {_t("SUBJECT TO AVAILABILITY*")}
            </p>
          </div>
        </div>
      </Carousel>
  );
};

export default Slider;
