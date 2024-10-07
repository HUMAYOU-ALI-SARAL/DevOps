import { ArrowLeft, Plus } from "@/components/Common/Icons"
import SliderImg from '@/public/img/slider/FavouriteSlider.png'
import React, { useRef, useState } from 'react';
import Liked from '@/public/img/NewProfile/Item.png'
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
// import Swiper and modules styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
// import required modules
import { Navigation } from 'swiper/modules';
import { FaCircleChevronRight } from "react-icons/fa6";

const Favourites = () => {
   const swiperRef: any = useRef(null);
   const Next = () => { if (swiperRef.current && swiperRef.current?.swiper) { swiperRef?.current?.swiper.slideNext() } }
   const Prev = () => { if (swiperRef.current && swiperRef.current?.swiper) { swiperRef?.current?.swiper.slidePrev() } }
   return (
      <div className="w-[100%] px-[160px] py-[62px] relative bg-[#1c1c1c]"
         style={{
            boxShadow: "rgba(0, 0, 0, 0.3) 0px -5px 15px 0px",
            borderRadius: "30px 30px 0px 0px"
         }}>
         {/* <div className="flex items-center justify-between w-[100%] pb-[50px]">
            <h2 className="text-[25px] font-bold">Grouped favorite</h2>
            <button className="flex gap-[1px] items-center" style={{ border: "1px solid #454545", padding: "5px 10px", borderRadius: "10px", background: "rgba(45,45,45,0.4)" }}>
               <Plus />
               <span>Create group</span>
            </button>
         </div> */}
         {/* <div className="relative w-[100%]">
            <Swiper
               slidesPerView={3}
               spaceBetween={20}
               ref={swiperRef}
               modules={[Navigation]}
               className="mySwiper"
            >
               {Array(6).fill(null).map((_, index) => (
                  <SwiperSlide key={index}>
                     <div className="w-11/12 h-[560px]">
                        <div className="relative w-[440px]">
                           <div className="grid grid-cols-2">
                              {Array(4).fill(null).map((_, idx) => (
                                 <div key={idx}>
                                    <img src={SliderImg.src} width="221px" height="195px" alt="FavouriteSlider" />
                                 </div>
                              ))}
                           </div>
                           <div className="bg-black w-full p-5 absolute left-0 top-full flex items-center justify-between">
                              <h2>Sports to buy later</h2>
                              <ArrowLeft />
                           </div>
                        </div>
                     </div>
                  </SwiperSlide>
               ))}
            </Swiper>
            <div onClick={Prev} className='absolute left-[-5%] top-[37%] w-[50px] h-[50x] z-100 p-2'>
               <FaCircleChevronRight style={{ transform: 'rotate(180deg)', width: "100%", zIndex: "10" }} size={30} color='gray' />
            </div>
            <div onClick={Next} className='absolute right-[-1%] top-[37%] w-[50px] h-[50x] z-50 p-2'>
               <FaCircleChevronRight style={{ width: "100%", zIndex: "1000" }} size={30} color='gray' />
            </div>
         </div> */}

         <div className="pb-[70px]">
            <h2 className="text-[25px] font-bold pb-[30px]">All Liked</h2>
            <div>
               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "50px" }}>
                  <img src={Liked.src} alt="" />
                  <img src={Liked.src} alt="" />
                  <img src={Liked.src} alt="" />
                  <img src={Liked.src} alt="" />
                  <img src={Liked.src} alt="" />
                  <img src={Liked.src} alt="" />
                  <img src={Liked.src} alt="" />
                  <img src={Liked.src} alt="" />

               </div>
            </div>
         </div>

      </div>
   )
}
export default Favourites