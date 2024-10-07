import { CiHeart } from "react-icons/ci";
import styles from '../styles.module.scss'

type Props = {
  nft: any
}

const ItemCards = ({nft}:Props) => {
  return (
    <div className={`relative ${styles.ItemsGridBody}`}>
        <div className={`h-[280px] w-[280px] ${styles.ItemCard}`}>
          <img alt="image" className="w-[100%]" src={nft?.metadata?.image}/>
        </div>
        <div className='w-[270px] absolute top-[210px] px-2 flex items-center justify-between'>
            <div>
                <p className='text-[15px]'>{nft?.token?.name}</p>
                <p className='text-[18px] font-bold'>{nft?.metadata?.name}</p>
            </div>
            <div>
                <CiHeart color="#FF7F2A" size={30}/>
            </div>
        </div>
    </div>
  )
}

export default ItemCards