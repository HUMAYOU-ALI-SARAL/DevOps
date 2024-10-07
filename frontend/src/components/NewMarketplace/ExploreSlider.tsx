import { useEffect, useState } from "react";
import { useGetCollectionsMutation } from "@/api/blockchainApi";
import { Carousel } from "react-responsive-carousel";
import Loader from "../Common/Loader";
import TabCard from "./Cards/TabCard"; // Import TabCard
import { NftCollection } from "@/types/blockchain.type";

const ExploreSlider = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [collections, setCollections] = useState<NftCollection[]>([]);
  const [getCollections, getCollectionsStatus] = useGetCollectionsMutation();

  const fetchCollections = () => {
    getCollections({}).unwrap()
      .then((response) => {
        const { collections } = response;
        console.log("collections", collections);
        setCollections(collections);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const groupedCollections = [];

  for (let i = 0; i < collections.length; i += 3) {
    groupedCollections.push(collections.slice(i, i + 3));
  }

  const renderIndicator = (onClickHandler: any, isSelected: any, index: any, label: any) => (
    <li
      className={`w-[50px] h-[5px] ${isSelected ? 'bg-orange' : 'bg-sp-gray'}`}
      onClick={onClickHandler}
      onKeyDown={onClickHandler}
      value={index}
      key={index}
      role="button"
      tabIndex={0}
      title={`${label} ${index + 1}`}
      aria-label={`${label} ${index + 1}`}
    />
  );

  return (
    <>
      <div className="w-[100%] text-center mt-[-40px]">
        <p className="text-[32px] font-bold">Explore</p>
      </div>

      {(isLoading || getCollectionsStatus.isLoading) ? (
        <Loader />
      ) : (
        <Carousel
          autoPlay={true}
          infiniteLoop={true}
          interval={10000}
          showArrows={false}
          showThumbs={false}
          showStatus={false}
          renderIndicator={renderIndicator}
        >
          {groupedCollections.map((group, index) => (
            <div key={index} className="flex gap-6 items-center justify-center">
              {group.map((collection) => (
                <TabCard
                  key={collection.token_id}
                  width="25%"
                  height={250}
                  showButton={false}
                  imageWidth={15}
                  imageHeight={15}
                  textStyle={false}
                  exploreText={true}
                  collectionName={collection.name} tokenId={collection?.token_id} collectionImage={collection?.metadata?.image}
                />
              ))}
            </div>
          ))}
        </Carousel>
      )}
    </>
  );
};

export default ExploreSlider;
