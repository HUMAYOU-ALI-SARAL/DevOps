import { useGetCollectionsMutation, useGetNftsMutation } from '@/api/blockchainApi';
import { Nft, NftCollection } from '@/types/blockchain.type';
import { useState, useEffect } from 'react';

function VolumeChange({collection}:any) {
  const [volume, setVolume] = useState<any>(0); // Current volume
  const [VolumeChange, setVolumeChange] = useState<any>(0); // Current volume
  const [getCollections] = useGetCollectionsMutation();
  
  const [newVolume, setNewVolume] = useState<any>(); // New volume change, initialized as null
  const [isLoading, setIsLoading] = useState(false);
  const [getNfts] = useGetNftsMutation();
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [pageNo,setPageNo]=useState<any>(1);
  
 
  useEffect(() => {

    fetchNfts();
  }, [pageNo]);

  const filterCollection = nfts.filter((item) => item.token.token_id== collection)
  useEffect(() => {
    if (filterCollection.length > 0) {
      // Calculate total volume excluding the last item's price
      const LastVolume = filterCollection.reduce((sum, item) => sum + Number(item.price), 0) - Number(filterCollection[filterCollection.length - 1].price);
      
      const volumeInPrice = Number(filterCollection[filterCollection.length - 1].price);
      setNewVolume(volumeInPrice);
      
      // Log if LastVolume is negative
      console.log(LastVolume < 0);
  
      // Use Math.abs for handling negative values
      const lastVolume = LastVolume < 0 ? Math.abs(LastVolume) + volumeInPrice : volumeInPrice;
  
      // Prevent division by zero
      const volumeChangeInPercent = volumeInPrice !== 0 ? (LastVolume / volumeInPrice) * 100 : 0;
      
      setVolume(Number(volumeChangeInPercent).toFixed(2));
    }
  }, [nfts,filterCollection]);



  const fetchNfts = () => {
    setIsLoading(true);
    getNfts({
      pageSize: 1000,
      page:pageNo,
      orderDirection: "desc",
      isMarketListed: true,
    })
      .unwrap()
      .then((response:any) => {
        const { nfts,isLastPage} = response;
        setNfts(nfts);
        !isLastPage?setPageNo(pageNo+1):""
      })
      .catch((error) => {
        console.error('Error fetching NFTs:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div>
      {isLoading ? (
        <p>...</p>
      ) : (
        <>
          <p>{volume}%</p>
        </>
      )}
    </div>
  );
}

export default VolumeChange;
