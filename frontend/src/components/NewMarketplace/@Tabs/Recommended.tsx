// Import Swiper React components
import { useGetCollectionsMutation } from '@/api/blockchainApi';
import { NftCollection } from '@/types/blockchain.type';
import { useEffect, useState } from 'react';
import { setIsLoading } from '@/reducers/blade.slice';
import RecommendedCard from '../Cards/RecommendedCard';
import Loader from "../../../components/Common/Loader";
import { Carousel } from "react-responsive-carousel";

const Recommended = () => {
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

  // Group collections by 4 for the carousel
  const groupedCollections = [];
  for (let i = 0; i < collections.length; i += 4) {
    groupedCollections.push(collections.slice(i, i + 4));
  }

  // Custom render indicator for the carousel
  const renderIndicator = (onClickHandler: any, isSelected: any, index: any, label: any) => (
    <li
      className={`w-[100px] h-[5px] mt-8 ${isSelected ? 'bg-orange' : 'bg-sp-gray'}`}
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
    <div>
      <div className='max-w-[100%] mt-8'>
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
              <div key={index} className="flex gap-6 items-center justify-center" >
                {group.map((collection) => (
                  <RecommendedCard
                    key={collection.id}
                    width="250px"
                    height={250}
                    collectionName={collection.name}
                    tokenId={collection?.token_id}
                    collectionImage={collection.metadata?.image}
                  />
                ))}
              </div>
            ))}
          </Carousel>
        )}
      </div>
    </div>
  );
};

export default Recommended;
