import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SphereLogo from 'public/solo-logo.png';
import styles from '../styles.module.scss';
import ProfileMenu from './ProfileMenu';
import { useRouter } from 'next/router';
import { useUser } from '@/providers/user.provider';
import { Button, Modal } from 'flowbite-react';
import { RxCross2 } from 'react-icons/rx';
import { Client, Hbar, TransferTransaction } from '@hashgraph/sdk';
import { FaDiscord } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";


const Header = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { setGlobalSearch } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = (key: any) => {
    if (key === 'Enter') {
      setGlobalSearch(searchQuery);
      router.push(`/marketplace/search?q=${searchQuery}`);
    }
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleAmountChange = (value: any) => {
    const numValue = Number(value);
    if (numValue <= 100) {
      setAmount(value);
    }
  };

  const hbarTransferHandler = async (amount: any) => {
    const accId = localStorage.getItem('walletAccount_id');

    if (accId) {
      const myAccountId = '0.0.3562965';
      const myPrivateKey = '302e020100300506032b657004220420b2597f0e0146e951fc93c5e9463b1d8469a25f84c44913ab3ea477c9cd6e75f7';
      const client = Client.forTestnet();
      client.setOperator(myAccountId, myPrivateKey);
      client.setDefaultMaxTransactionFee(new Hbar(100));
      client.setMaxQueryPayment(new Hbar(50));

      try {
        setLoading(true);
        await new TransferTransaction()
          .addHbarTransfer(myAccountId, Hbar.fromTinybars(`-${amount}00000000`))
          .addHbarTransfer(accId, Hbar.fromTinybars(`${amount}00000000`))
          .execute(client);

        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }, 3000);
      } catch (error) {
        console.error('Transfer failed:', error);
      } finally {
        setLoading(false);
      }
    }
    closeModal();
  };

  return (
    <nav className={`${styles.navbar}`}>
      <div className='flex items-center gap-4'>
        <Link href="/marketplace" className="mr-5 rtl:ml-5">
          <Image src={SphereLogo.src} alt="logo" width={48} height={48}></Image>
        </Link>
        <input
          type="text"
          value={searchQuery}
          onKeyUp={(event) => handleSearch(event.key)}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="max-w-[350px] bg-[#292929] h-10 placeholder-neutral-500 text-white rounded-lg focus:ring-orange-hover focus:border-orange-hover p-2.5 "
          placeholder="Search NFT Collections and Collectors"
          style={{ fontSize: '14px', border: '2px solid #5f5f5f' }}
        >
        </input>
      </div>


      {/* <div className={`relative w-[45px] h-[26px] ${styles.shadow_top_bottom}`}>
        <div className='absolute inset-0 flex justify-between items-center bg-[#3f3f3f] border-[2px] border-[#656565] rounded-2xl'>
          <Image src={Ether.src} alt="logo" width={26} height={26} className='absolute left-[-8px] w-[26px]'></Image>
          <Image src={Hadera.src} alt="logo" width={26} height={26} className='absolute right-[-8px] w-[26px] z-[1] bg-[#3F3F3F] rounded-full'></Image>
        </div> 
      </div> */}

      {/* <div className={`relative w-[230px] h-[40px] ml-[30px] rounded-2xl ${styles.shadow_top_bottom}`}>
        <div className='w-[230px] h-[50px] mt-[-4px] ml-[-4px] p-2 overflow-hidden flex justify-between items-center'>
          <div className='absolute p-2 rounded-2xl mt-[-4px] ml-[-13px] bg-gradient-to-t from-[#FF7F2A] to-[#3F3F3F] shadow-[0px_4px_15px_rgba(255,127,42,0.5)]'>
            <Image src={SphereLogo.src} alt="logo" width={30} height={26} className='' />
          </div>
          <div className={`w-[350px] ${styles.shadow_box}`}>
            <p className='text-[15px] text-[#FF7F2A] ml-[40px]'>Mint your SpheraID</p>
          </div>
        </div>
      </div> */}


      <div className="flex items-center gap-8 ">
        <Link href="/allCollections">
          <span className='font-thin text-[14px]'>Discover</span>
        </Link>
        <div className='flex items-center justify-center gap-1'>
          <span className='font-thin text-[14px]'>Buy</span>
          <span className='font-thin text-[14px]'>$SPHERA</span>
        </div>
        <span>
          <a href="https://discord.com/invite/CwM2H5GUcR" target="_blank" rel="noopener noreferrer">
            <FaDiscord size={28} />
          </a>
        </span>
        <span>
          <a href="https://x.com/spheraworld" target="_blank" rel="noopener noreferrer">
            <FaXTwitter size={24} />
          </a>
        </span>

        <ProfileMenu />
      </div>

      <Modal show={showModal} className={`${styles.modalContainer}`}>
        <div className="p-5 flex flex-col text-white rounded-lg relative">
          <p className="text-center text-[30px] font-bold">Select amount of hbar to top up</p>
          <RxCross2
            size={30}
            onClick={closeModal}
            className="absolute top-5 right-5 cursor-pointer"
          />
          <input
            type="text"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="w-full mt-5 border-2 border-white bg-transparent rounded-md"
          />
          <p className="mt-1">Max: 100 hbar</p>
          <div className="flex flex-row justify-center gap-6 mt-10">
            {['10', '50', '100'].map((amt) => (
              <button
                key={amt}
                onClick={() => handleAmountChange(amt)}
                className="py-2 px-4 bg-slate-500 rounded-md"
              >
                {amt} hbar
              </button>
            ))}
          </div>
          <div className="flex flex-row justify-center gap-6 mt-10">
            <Button
              onClick={() => hbarTransferHandler(amount)}
              className="rounded-[5px] bg-[orange] border-none h-[50px] text-white min-w-[270px]"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Top Up'}
            </Button>
          </div>
        </div>
      </Modal>
    </nav>
  );
};

export default Header;
