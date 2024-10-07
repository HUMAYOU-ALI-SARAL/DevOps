import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useTranslate } from "@/providers/translate.provider";
import { Nft, NftCollection } from "@/types/blockchain.type";
import { useGetNftsMutation } from "@/api/blockchainApi";
import { SPHERA_WORLD } from "@/constants/app.constants";
import overviewData from "@/Data/Collection/Overview.js";
import { GoDotFill } from "react-icons/go";
import Faq from '@/components/Collection/Tabs/Overview/Faq'
import { RxLetterCaseLowercase } from "react-icons/rx";

interface IORecent {
  collection: NftCollection;
  url_ID: string;
}

// const urlIdToIndex: { [key: string]: number } = {
//   "RallyLegends Archive": 0,
//   "Motocross": 1,
//   "CageCombat Chronicles": 2,
//   "Esport Elite Icons": 3,
//   "Speedscape Grand Prix": 4,
//   "Football NFT": 5,
//   "DesertDash": 6,
//   "Cricket Legends Vault": 7,
//   "PunchCraft Legends": 8,
//   "SlamDunk Dynasty": 9,
// };

const RecentBlock = ({ collection, url_ID }: IORecent) => {
  const { _t } = useTranslate();
  const [nfts, setNfts] = useState<Nft[]>([]);

  const [getNfts] = useGetNftsMutation();

  const fetchNfts = useCallback(() => {
    getNfts({
      pageSize: 8,
      nftCreator: SPHERA_WORLD,
      tokenId: collection.token_id,
    })
      .unwrap()
      .then((response:any) => {
        const { nfts } = response;
        setNfts(nfts);
      })
      .catch((error:any) => {
        console.error("Failed to fetch NFTs:", error);
      });
  }, [collection.token_id, getNfts]);

  useEffect(() => {
    fetchNfts();
  }, [fetchNfts]);
  
  // const dataIndex = urlIdToIndex[url_ID as keyof typeof urlIdToIndex];
  let data;
   switch (collection.name) {
    case "RallyLegends Archive":
      data = overviewData[0];
      break;
    case "Motocross":
      data = overviewData[1];
      break;
    case "CageCombat Chronicles":
      data = overviewData[2];
      break;
    case "Esport Elite Icons":
      data = overviewData[3];
      break;
    case "Speedscape Grand Prix":
      data = overviewData[4];
      break;
    case "Football NFT":
      data = overviewData[5];
      break;
    case "DesertDash":
      data = overviewData[6];
      break;
    case "Cricket Legends Vault":
      data = overviewData[7];
      break;
    case "PunchCraft Legends":
      data = overviewData[8];
      break;
    case "SlamDunk Dynasty":
      data = overviewData[9];
      break;
    default:
      console.error("Unknown collection name:", collection.name);
  }
  if (!data) {
    console.error("Data not found for url_ID:", url_ID);
    return null;
  }

  console.log("RecenBloack page is calling.");
  

  return (
    <>
      <div className="relative w-full py-24 bg-[#1c1c1c]">
        <div className="grid grid-cols-12 pb-24 gap-x-5">
          <div className="row-span-full col-start-2 col-end-7">
            <Image quality={100} sizes="100vw" src={data.image} alt="player" />
          </div>
          <div className="row-span-full col-start-7 col-end-12 mt-6">
            <p className="flex items-center gap-2 text-[16px]"><GoDotFill color="#FF7F2A" size={30} />Floor price: <span className="font-light text-[18px]">169 ETH</span></p>
            <div className="w-[100%] mt-4 flex items-center gap-4">
              <div className="border-2 border-[#FF7F2A] rounded-md bg-[#33261d] w-[150px]  p-3">
                <p className="text-[20px] text-[#FF7F2A]">Total Supply</p>
                <p className="text-[20px] text-[#fff]">10,000</p>
              </div>
              <div className="border-2 border-[#FF7F2A] rounded-md bg-[#33261d] w-[150px]  p-3">
                <p className="text-[20px] text-[#FF7F2A]">Royalties</p>
                <p className="text-[20px] text-[#fff]">5%</p>
              </div>
              <div className="border-2 border-[#FF7F2A] rounded-md bg-[#33261d] w-[150px]  p-3">
                <p className="text-[20px] text-[#FF7F2A]">Minted</p>
                <p className="text-[20px] text-[#fff]">55%</p>
              </div>
            </div>
            <div className="flex flex-col gap-4 mt-4">
              <p className="text-[18px] font-thin">{data.text.paragraph1}</p>
              <p className="text-[18px] font-thin">Unlock your sports avatar at absolutely no cost and proudly display your allegiance to your favorite team! Join the vibrant community on the Sphera platform, where you can connect with fellow fans, engage in lively discussions, and cheer on your team together. Embrace the spirit of camaraderie as you interact with like-minded individuals, sharing your passion for sports and fostering a sense of unity. Claim your avatar today and let your team pride shine bright in the virtual realm!</p>
            </div>
          </div>
        </div>

        <div className="w-full h-[500px] overflow-hidden">
          <Image quality={100} sizes="100vw" src={data.banner} alt="player" />
        </div>

        <div className="grid grid-cols-12 pb-24 gap-x-5 pt-24">
          <div className="row-span-full col-start-2 col-end-7">
            <Image quality={100} sizes="100vw" src={data.image} alt="player" />
          </div>
          <div className="row-span-full col-start-7 col-end-12 mt-6">
            <p className="text-[#FF7F2A] text-[28px] font-normal">Claim Your Free SpheraHead</p>
            <ol className="font-light text-[16px] mt-2 flex flex-col gap-2 ml-4" style={{ listStyle: "number" }} >
              <li>Click the &apos;Claim Now&apos; Button: It&apos;s your first step to becoming a proud Sphera Head owner.</li>
              <li>Sign Up: If you&apos;re new to Sphera World, sign up for an account. It&apos;s quick, easy, and secures your spot in the digital collectibles revolution.</li>
              <li>Confirm Your Claim: Once you&apos;ve made your choice, confirm your claim, and your Sphera Head will be securely stored in your digital wallet.</li>
            </ol>
            <p className="text-[#FF7F2A] text-[28px] font-normal mt-8">Connect with Like-Minded Fans</p>
            <ol className="font-light text-[16px] mt-2 flex flex-col gap-2 ml-4" style={{ listStyle: "number" }} >
              <li>Claim Your Free Sphera Head: If you haven&apos;t already, follow the steps to claim your free Sphera Head. This is your entry ticket to our vibrant community.</li>
              <li>Explore Our Community: Once you own a Sphera Head, visit our Discord to dive into discussions, see what others are collecting, and join in the conversation.</li>
              <li>Participate in Events: Keep an eye on our community events, where you can participate, win prizes, and connect with fellow members.</li>
            </ol>
          </div>
        </div>

        <div className="grid grid-cols-12 relative pt-12">
          <div className="row-span-full col-start-2 col-end-7 max-w-[776px] z-[2]">
            <p className="text-[42px] font-abz">{_t("Benefits")}:</p>
            <p className="text-20  leading-9 pt-5 font-light">
              {_t(
                "As collectors acquire and trade these digital assets, they become part of a vibrant community of football enthusiasts, united by their love for the game and their appreciation for its rich history."
              )}
            </p>
            <ol className="font-inter text-16 pl-8 rtl:pr-8 mt-5 font-light" style={{ listStyle: "disc" }} >
              <li>{_t("Ownership and Rarity")}</li>
              <li>{_t("Community Engagement")}</li>
              <li>{_t("Historical Significance")}</li>
              <li>{_t("Prize Giveaways")}</li>
              <li>{_t("VIP Community Access")}</li>
              <li>{_t("IRL Meet-ups")}</li>
            </ol>
          </div>
          <div className="row-span-full col-start-9 col-end-13 mr-12">
            <Image quality={100} sizes="100vw" src={data.benefits} alt="player" className="w-[450px] h-[450px]" />
          </div>
        </div>

      </div>
      <div>
        <Faq />
      </div>
    </>
  );
};

export default RecentBlock;
