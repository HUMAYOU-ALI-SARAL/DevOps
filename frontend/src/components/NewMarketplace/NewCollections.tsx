import React, { useEffect, useState } from 'react';
import { useGetCollectionsMutation } from "@/api/blockchainApi";
import CollectionCard from './Cards/CollectionCard';
import { Carousel } from 'react-responsive-carousel';
import Loader from "../Common/Loader";
import { NftCollection } from "@/types/blockchain.type";
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // Import carousel styles

const NewCollections: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [collections, setCollections] = useState<NftCollection[]>([]);
    const [getCollections, getCollectionsStatus] = useGetCollectionsMutation();

    const fetchCollections = () => {
        getCollections({}).unwrap()
            .then((response) => {
                const { collections } = response;
                console.log("Collections", collections);

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

    const renderIndicator = (onClickHandler: React.MouseEventHandler<HTMLLIElement>, isSelected: boolean, index: number, label: string) => (
        <li
            className={`w-[50px] h-[5px] ${isSelected ? 'bg-orange' : 'bg-sp-gray'}`}
            onClick={onClickHandler}
            value={index}
            key={index}
            role="button"
            tabIndex={0}
            title={`${label} ${index + 1}`}
            aria-label={`${label} ${index + 1}`}
        />
    );

    return (
        <div className="w-full h-auto">
            <div className='w-[1250px] m-auto my-6'>
                <span className="text-[24px] text-start">New Collection</span>
            </div>
            {isLoading || getCollectionsStatus.isLoading ? (
                <Loader />
            ) : (
                <>
                    {/* <div className="flex flex-wrap justify-center gap-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <CollectionCard key={index} />
                        ))}
                    </div> */}

                    <div className="mt-8">
                        <Carousel
                            autoPlay
                            infiniteLoop
                            interval={10000}
                            showArrows={false}
                            showThumbs={false}
                            showStatus={false}
                            renderIndicator={renderIndicator}
                        >
                            {groupedCollections.map((group, index) => (
                                <div key={index} className="flex gap-6 items-center justify-center">
                                    {group.map((collection) => (
                                        <CollectionCard
                                            key={collection.token_id}
                                            collection={collection}
                                            width="400px"
                                            height="250px"
                                        />
                                    ))}
                                </div>
                            ))}
                        </Carousel>
                    </div>
                </>
            )}
        </div>
    );
};

export default NewCollections;
