import React from 'react'
import Input from "@/components/Common/Input";
import { BigGridIcon, GridIcon, SearchIcon } from "@/components/Common/Icons";
import Select from "@/components/Common/Select";
import ItemCard from "./ItemCards";
import styles from '../styles.module.scss'

type Props = {
    nftItem: any
}

const ItemGrid = ({ nftItem }: Props) => {

    console.log("nftItem",nftItem);
    
    return (
        <div className={`mt-[200px] ${styles.ItemGrid}`}>
            {/* Grid Header  */}
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                    <p className="text-[20px]">Select All</p>
                    <input type="checkbox" style={{ width: "20px", height: "20px", backgroundColor: "transparent", border: '2px solid white', borderRadius: '3px' }} />
                    <p className="text-[20px]">List</p>
                    <p className="text-[20px]">Transfer</p>
                    <Input
                        leftAdornment={<SearchIcon className="text-placeholder cursor-pointer" />}
                        placeholder="Genesis SpheraHead..."
                    />
                </div>
                <div className='flex items-center gap-2'>
                    <button className="hover:bg-slate-200 hover:text-orange p-1 rounded-md">
                        <GridIcon />
                    </button>
                    <button className="hover:bg-slate-200 hover:text-orange p-1 rounded-md">
                        <BigGridIcon />
                    </button>
                    <div className="flex gap-6 items-center">
                        <Select
                            options={[
                                { label: "All", value: "all" },
                                { label: "Listed", value: "listed" }
                            ]}
                            label="Status:"
                        />
                    </div>
                </div>
            </div>
            {/* Grid Body  */}
            <div className={`mt-12 h-[900px] overflow-y-scroll ${styles.customScrollbar}`}>
                <div className='flex flex-wrap gap-6'>
                    {
                        nftItem.length > 0 && nftItem.map((item: any) => {
                            return 
                            <ItemCard key={item.token_id} nft={item} />
                        })
                    }
                    {/* <ItemCard /> */}
                </div>
            </div>

        </div>
    )
}

export default ItemGrid