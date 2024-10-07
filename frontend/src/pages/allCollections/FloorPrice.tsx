import { useGetNftsMutation } from "@/api/blockchainApi";
import { useBladeWallet } from "@/providers/blade-wallet.provider";
import { Nft } from "@/types/blockchain.type";
import { useCallback, useEffect, useState } from "react";

const FloorPrice=({collection}:any)=>{
    const [pageNo,setPageNo]=useState<any>(1);
    const [nfts, setNfts] = useState<Nft[]>([])
    const [getNfts] = useGetNftsMutation();[]>([]);
    const { tinyBarToHbar } = useBladeWallet()
    const [isLoading, setIsLoading] = useState(false);
    const [floor, setFloor] = useState<any>();
  
    const fetchNfts = useCallback(() => {
      setIsLoading(true);
      getNfts({
        page: pageNo,
        pageSize: 10,
        orderDirection: 'desc',
        isMarketListed: true,
      })
        .unwrap()
        .then((response:any) => {
          const { nfts, isLastPage } = response;
          console.log(nfts);
          setNfts((prevNfts:any) => [...prevNfts, ...nfts]);
          !isLastPage ? setPageNo(pageNo + 1) : console.log(isLastPage, 'yes this is page');
        })
        .catch((error) => {
          console.error('Error fetching NFTs:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, [pageNo]);
  
    const filterCollection = useCallback(() => {
      const fc = nfts.filter((item) => item.token.token_id === collection);
    
      if (fc.length > 0) {
        // Sort the array
        const sortedArray = fc.sort((a, b) => Number(a.price) - Number(b.price));
    
        // Eliminate duplicates
        const uniqueArray = [];
        const seenPrices = new Set();
    
        for (const item of sortedArray) {
          if (!seenPrices.has(item.price)) {
            uniqueArray.push(item);
            seenPrices.add(item.price);
          }
        }
        console.log(uniqueArray)
        // Set the floor price
        return uniqueArray.length > 0 && uniqueArray[0].price
          ? setFloor(tinyBarToHbar(BigInt(uniqueArray[0]?.price)))
          : setFloor(tinyBarToHbar(BigInt(0)));
      }
      return tinyBarToHbar(BigInt(0));
    }, [pageNo]);
    
  
    useEffect(() => {
      fetchNfts();
      filterCollection();
    }, [pageNo]);
  
      return(
        <p>{floor?floor:tinyBarToHbar(BigInt(0))}</p>
      )

}

export default FloorPrice
