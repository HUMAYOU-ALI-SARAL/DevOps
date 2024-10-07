import React, { useCallback, useEffect, useState } from 'react';

import ItemsGrid from './Common/ItemsGrid';

import AchievementsItem from '@/components/Items/Achievement/AchievementsItem';
import { UserProfileType } from '@/types/user.type';
import Ach1 from '@/public/img/achievements/logo-1.png';
import Ach2 from '@/public/img/achievements/logo-2.png';
import Ach3 from '@/public/img/achievements/logo-3.png';
import Ach4 from '@/public/img/achievements/logo-4.png';
import Ach6 from '@/public/img/achievements/logo-6.png';
import Heading from '@/public/HeadinAch.png';

type Props = {
  userProfile: UserProfileType;
};
const Achievements = ({ userProfile }: Props) => {
  const [isLastPage, setIsLastPage] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);

  return (
    <div className="px-[100px] py-[70px] gap-6 w-[100%] bg-[#1c1c1c]"
      style={{
        boxShadow: "rgba(0, 0, 0, 0.5) 0px -5px 15px 0px",
        borderRadius: "30px 30px 0px 0px"
      }}>
      {/* <AchievementsItem userProfile={userProfile} /> */}
      <h2 className="text-[30px] font-bold">My Achievements</h2>
      {/* <div className="w-[100%] pt-[49px]">
        <div className="flex w-[100%] items-center justify-between">
          <h2 className="font-bold text-[25px]">Sphere score</h2>
          <h2 className="font-bold text-[25px]">Level: 6</h2>
        </div>
        <div className="w-[100%] bg-[#252525] h-[18px] rounded-full mt-[30px]">
          <div
            className="w-[40%] h-[100%] rounded-full"
            style={{
              boxShadow:
                '0 0 6px rgba(255, 127, 42, 0.9), 0 0 6px rgba(255, 127, 42, 0.6), 0 0 20px rgba(255, 127, 42, 0.5)',
              background: 'rgb(255, 108, 0)',
            }}
          ></div>
        </div>
        <div className="text-[20px] font-bold flex justify-between items-center pt-[20px]">
          <h2>150</h2>
          <h2>300</h2>
        </div>
      </div> */}

      <div className="py-[80px] ">
        <div className="flex justify-center mb-[40px]">
          <img src={Heading.src} alt="" />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            height: '250px',
            marginBottom: "50px",
            borderRadius: '5px',
            boxShadow: 'rgba(0, 0, 0, 0.5) 0px 24px 25px inset, rgba(0, 0, 0, 0.5) 0px -12px 30px inset, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.1) 0px 12px 13px inset, rgba(0, 0, 0, 0.01) 0px -3px 5px inset',
            border: '3px solid #2424241A',
          }}
        >
          <img src={Ach1.src} alt="Achivement" width={'120px'} />
          <img src={Ach2.src} alt="Achivement" width={'120px'} />
          <img src={Ach3.src} alt="Achivement" width={'120px'} />
          <img src={Ach4.src} alt="Achivement" width={'120px'} />
          <img src={Ach1.src} alt="Achivement" width={'120px'} />
          <img src={Ach2.src} alt="Achivement" width={'120px'} />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            height: '250px',
            borderRadius: '5px',
            marginBottom: "50px",
            boxShadow: 'rgba(0, 0, 0, 0.5) 0px 24px 25px inset, rgba(0, 0, 0, 0.5) 0px -12px 30px inset, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.1) 0px 12px 13px inset, rgba(0, 0, 0, 0.01) 0px -3px 5px inset',
            border: '3px solid #2424241A',
          }}
        >
          <img src={Ach1.src} alt="Achivement" width={'120px'} />
          <img src={Ach2.src} alt="Achivement" width={'120px'} />
          <img src={Ach3.src} alt="Achivement" width={'120px'} />
          <img src={Ach4.src} alt="Achivement" width={'120px'} />
          <img src={Ach1.src} alt="Achivement" width={'120px'} />
          <img src={Ach2.src} alt="Achivement" width={'120px'} />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            height: '250px',
            borderRadius: '5px',
            boxShadow: 'rgba(0, 0, 0, 0.5) 0px 24px 25px inset, rgba(0, 0, 0, 0.5) 0px -12px 30px inset, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.1) 0px 12px 13px inset, rgba(0, 0, 0, 0.01) 0px -3px 5px inset',
            border: '3px solid #2424241A',
          }}
        >
          <img src={Ach1.src} alt="Achivement" width={'120px'} />
          <img src={Ach2.src} alt="Achivement" width={'120px'} />
          <img src={Ach3.src} alt="Achivement" width={'120px'} />
          <img src={Ach4.src} alt="Achivement" width={'120px'} />
          <img src={Ach1.src} alt="Achivement" width={'120px'} />
          <img src={Ach2.src} alt="Achivement" width={'120px'} />
        </div>
      </div>
    </div>
  );
};

export default Achievements;
