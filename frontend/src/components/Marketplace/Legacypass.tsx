import React from 'react';
import Image from 'next/image';

const Legacypass = () => {
    return (
        <div>
            <div className='min-w-[1100px] max-w-[1100px] rounded-xl bg-[#252525] p-12 flex justify-between items-center'>
                <div className='w-[350px]'>
                    <p className='text-[#fff] text-[24px]'>Legacy Pass</p>
                    <p className='text-[14px] mt-4 font-thin'>As stewards of our companys heritage, Legacy Pass holders
                        retain access to select company resources, events, and networks,
                        ensuring their continued connection to the Sphera family. We
                        recognize and value the enduring impact of their service, fostering
                        a culture of appreciation and respect for their enduring legacy.</p>
            <a href='https://sentx.io/nft-marketplace/legacy-pass' target='_blank'>
                    <button className='bg-[#3E3E3E] px-12 py-1 rounded-full mt-4' style={{ border:"1px solid orange" }} >BUY</button>

                         </a>
                </div>
                <div className='w-[50%] h-[300px]'>
                    <video 
                        src="/lagecy_pass.mp4" 
                        autoPlay 
                        muted 
                        loop 
                        className="w-full h-full object-cover rounded-xl "
                    />
                </div>
            </div>
        </div>
    )
}

export default Legacypass;
