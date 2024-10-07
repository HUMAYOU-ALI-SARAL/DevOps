import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

const Card = ({ Colimage, description, name, tokenId }: any) => {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/collection/${tokenId}?tab=overview`);
    };

    return (
        <div onClick={handleClick} className="cursor-pointer w-full h-[300px] bg-[#292929] rounded-[15px] p-2">
            <div style={{ backgroundImage: `url('${Colimage}')`, minHeight: '180px', minWidth: '100px', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius:"14px" }}></div>
            <div className="flex flex-col p-2 mt-1">
                <p className="text-[#fff] text-[14px] font-semibold mb-1">{name}</p>
                <p className="text-[#fff] text-[11px] font-extralight text-ellipsis line-clamp-3">{description}.</p>
            </div>
        </div>
    );
};

export default Card;
