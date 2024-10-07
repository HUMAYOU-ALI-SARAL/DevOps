import { useEffect, useState } from "react";
import { useGetCollectionsMutation } from "@/api/blockchainApi";
import { Carousel } from "react-responsive-carousel";
import CollectionItem from "../Items/Collection/CollectionItem";
import Loader from "../Common/Loader";
import { NftCollection } from "@/types/blockchain.type";

const Slider = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [collections, setCollections] = useState<NftCollection[]>([]);
  const [getCollections, getCollectionsStatus] = useGetCollectionsMutation();

  const fetchCollections = () => {
    getCollections({}).unwrap()
      .then((response) => {
        const { collections } = response;
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

  const renderIndicator = (onClickHandler:any, isSelected:any, index:any, label:any) => (
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
                <CollectionItem
                  onMarketPage={true}
                  key={collection.token_id}
                  collection={collection}
                  height={350}
                  width="22%"
                />
              ))}
            </div>
          ))}
        </Carousel>
      )}
    </>
  );
};

export default Slider;
