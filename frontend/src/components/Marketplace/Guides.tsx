import React from 'react'
import guide1 from '@/public/img/marketplace/Guides/guide1.png'
import guide2 from '@/public/img/marketplace/Guides/guide2.png'
import guide3 from '@/public/img/marketplace/Guides/guide3.png'
import Image from 'next/image'

const Guides = () => {
    return (
        <div>
            <p className='text-[#fff] text-[40px] font-extrabold w-full text-center my-4 font-dm '>HOW TO GUIDES</p>
            <div className='flex items-center justify-center gap-8'>
                <Image sizes="100vw" src={guide1} alt="image" className='w-[400px] duration-300 ease-in-out hover:scale-110 cursor-pointer	'  />
                <Image sizes="100vw" src={guide2} alt="image" className='w-[400px] duration-300 ease-in-out hover:scale-110 cursor-pointer	'/>
                <Image sizes="100vw" src={guide3} alt="image" className='w-[400px] duration-300 ease-in-out hover:scale-110 cursor-pointer	'/>
            </div>
        </div>
    )
}

export default Guides
