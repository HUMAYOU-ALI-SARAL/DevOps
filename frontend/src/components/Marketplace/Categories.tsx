import React, { useState } from "react";
import Link from 'next/link';

const CategoryItem = ({
  label,
  imgSrc,
  className,
  onMouseEnter,
  onMouseLeave,
}: { label: string; imgSrc: string; onMouseEnter?: () => void; onMouseLeave?: () => void } & React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`relative overflow-hidden py-[100px] px-12 cursor-pointer border border-orange rounded-t-[10px] ${className ?? ""}`}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <div className="absolute inset-0">
      <img alt="image" src={imgSrc} className="object-cover w-full h-full" />
    </div>
    <div className="absolute inset-0 flex items-center justify-center from-black to-black">
      <span className="text-[30px] font-bold">{label}</span>
    </div>
  </div>
);

const Categories = () => {
  const [trendingLabel, setTrendingLabel] = useState("TRENDING");

  const handleMouseEnter = () => {
    setTrendingLabel("Coming Soon");
  };

  const handleMouseLeave = () => {
    setTrendingLabel("TRENDING");
  };

  return (
    <>
      <span className="text-[31px]">
        Look for items, collections and accounts
      </span>
      <span className="text-[20px] font-light max-w-[500px]">
        There are 10,000 SpheraHeads available in the market. Dive into the
        sphera world.
      </span>
      <div className="flex justify-center w-full gap-6 mobile:flex-wrap">
        <Link href='/allCollections' className="w-1/3 mobile:w-full max-w-[444px]">
          <CategoryItem
            className="w-full"
            label="ALL COLLECTIONS"
            imgSrc="/img/presets/categories/image1.png"
          />
        </Link>
        <Link href='/allNfts' className="w-1/3 mobile:w-full max-w-[444px]">
          <CategoryItem
            className="w-full max-w-[444px]"
            label="RECENT LISTINGS"
            imgSrc="/img/presets/categories/image2.png"
          />
        </Link>
        <CategoryItem
          className="w-1/3 mobile:w-full max-w-[444px]"
          label={trendingLabel}
          imgSrc="/img/presets/categories/image3.png"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      </div>
    </>
  );
};

export default Categories;
