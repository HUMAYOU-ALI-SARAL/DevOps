import { Carousel } from "react-responsive-carousel";
import { useTranslate } from "@/providers/translate.provider";
import { MdOutlineKeyboardArrowLeft as ArrowLeftIcon } from "react-icons/md";
import { MdOutlineKeyboardArrowRight as ArrowRightIcon } from "react-icons/md";
import { useRouter } from "next/router";
import Button from "../Common/Button";
import { useState } from "react";
import styles from './styles.module.scss';

const Arrow = ({ left, onClick }: { left?: boolean; onClick: () => void }) => {
  return (
    <button
      className={`
                rounded-full w-12 h-12 bg-sp-gray flex items-center justify-center
                absolute z-10 cursor-pointer opacity-80 ${left ? "left-5 rtl:right-5" : "right-5 rtl:left-5"
        }
                `}
      style={{ bottom: "50%" }}
    >
      {left ? (
        <ArrowLeftIcon onClick={onClick} size={34} />
      ) : (
        <ArrowRightIcon onClick={onClick} size={34} />
      )}
    </button>
  );
};

const HeroSlider = () => {
  const { _t } = useTranslate();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpanded2, setIsExpanded2] = useState(false);

  const toggleReadMore = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleReadMore2 = () => {
    setIsExpanded2(!isExpanded2);
  };



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
      <div className={`${styles.slider} relative `}>
        <img src="/img/slider/first_banner.png" alt="image" className="h-[100vh]" />
        <div className="absolute bottom-[10%] left-[6%] right-[6%] font-actor flex items-end justify-between">
          <div className="flex flex-col items-start text-start w-2/3 gap-6">
            <Button className="text-white rounded-sm bg-red w-fit" label="Live Drop" />
            <span className="text-[40px]">SPHERA HEADS</span>
            <span className="text-xl font-inter">Current public price: <span className="text-2xl text-white"> 0.02</span><span className="text-2xl text-white">E</span></span>
            <div className="flex gap-12">
              <div className="flex flex-col">
                <span className="font-abz text-xl text-sp-gray-900">Total Supply</span>
                <span className="font-abz text-[25px]">10,000</span>
              </div>
              <div className="flex flex-col">
                <span className="font-abz text-xl text-sp-gray-900">Total Minted </span>
                <span className="font-abz text-[25px]">4,675</span>
              </div>
              <div className="flex flex-col">
                <span className="font-abz text-xl text-sp-gray-900">Unique Holders </span>
                <span className="font-abz text-[25px]">4,675</span>
              </div>
            </div>
          </div>
          {/* <Button type="button" className="text-white rounded-[5px]" label="Claim Now" /> */}
        </div>
      </div>

      <div className={`${styles.slider} relative `}>
        <img src="/img/slider/marketplace.png" alt="image" className="h-[100vh]" />
        <div className="absolute bottom-[10%] left-[6%] right-[6%] font-actor flex items-end justify-between">
          <div className="flex flex-col items-start text-start w-2/3 gap-6">
            <Button className="text-white rounded-sm bg-red w-fit" label="Live Drop" />
            <span className="font-abz text-[40px]">SPHERA HEADS</span>
            <span className="text-xl font-inter">Current public price: <span className="text-2xl text-white"> 0.02</span><span className="text-2xl text-white">E</span></span>
            <div className="flex gap-12">
              <div className="flex flex-col">
                <span className="font-abz text-xl text-sp-gray-900">Total Supply</span>
                <span className="font-abz text-[25px]">10,000</span>
              </div>
              <div className="flex flex-col">
                <span className="font-abz text-xl text-sp-gray-900">Total Minted </span>
                <span className="font-abz text-[25px]">4,675</span>
              </div>
              <div className="flex flex-col">
                <span className="font-abz text-xl text-sp-gray-900">Unique Holders </span>
                <span className="font-abz text-[25px]">4,675</span>
              </div>
            </div>
          </div>
        </div>
      </div>



    </Carousel>
  );
};

export default HeroSlider;
