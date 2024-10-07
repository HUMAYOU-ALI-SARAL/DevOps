import React, { useState, useEffect, useRef } from 'react';
import FingerPrint from "@/public/img/NewProfile/FingerPrint.png";
import Ach1 from "@/public/img/achievements/logo-1.png";
import Ach2 from "@/public/img/achievements/logo-2.png";
import Ach3 from "@/public/img/achievements/logo-3.png";
import Ach4 from "@/public/img/achievements/logo-4.png";
import Ach5 from "@/public/img/achievements/logo-6.png";
import high from '@/public/img/NewProfile/Highlight.png';
import empthigh from '@/public/img/NewProfile/empthigh.png';
import { UserProfileType } from "@/types/user.type";
import { IoReload } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import Modal from '@/components/Common/Modal';
import QRCodeGenerator from 'qrcode';
import styles from "../styles.module.scss";
import Web3 from 'web3';
import { toast } from 'react-toastify';
import Link from "next/link";
import { useUpdateBlockInfoMutation, useCheckSignatureMutation, useGetUserByIdMutation } from '@/api/userApi';
import {
  AccountId,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  PrivateKey,
  Client,
  Hbar,
  ContractCallQuery,
} from "@hashgraph/sdk";
import { useCreateFreeNftMutation, useGetNftClaimMutation } from '@/api/blockchainApi';
import { ethers } from 'ethers';
import { MAX_TRANSACTION_FEE, TRANSACTION_GAS } from '@/constants/app.constants';


type Props = {
  userProfile: UserProfileType;
  isOwner?: boolean;
};

interface Result {
  name: string;
  image: string;
  video: string;
  token_id?: string;
}

type NftClaimData = {
  account_id: string;
  id: number;
  image: string;
  name: string;
  video?: string;
  // token_id?: string;
};

const UserIdInfo = ({ userProfile }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [signatureFound, setSignatureFound] = useState(false);
  const [blockNumber, setBlockNumber] = useState<string | null>(null);
  const [step, setStep] = useState(1); // Step state
  const [claimNft, setClaimNFT] = useState(false)
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const [updateBlockInfo] = useUpdateBlockInfoMutation();
  const [checkSignature] = useCheckSignatureMutation();
  const [fetchUserProfile, { isSuccess: profileSuccess, data: profileData }] = useGetUserByIdMutation();
  const [createFreeNft] = useCreateFreeNftMutation();
  const [getNftClaim] = useGetNftClaimMutation();

  const [nftClaim, setNftClaim] = useState<NftClaimData | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  let [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorTrans, setRrrorTrans] = useState<string | null>(null);
  const [isNftModalOpen, setIsNftModalOpen] = useState(false); // For modal state

  const userPrivateKey: any = localStorage.getItem("walletAccount_privateKey");

  const populateAndRunTx = async (tx: any) => {
    const operatorKey = PrivateKey.fromStringDer(userPrivateKey);
    const hederaClient = process.env.NEXT_PUBLIC_HEDERA_NETWORK === 'testnet'
      ? Client.forTestnet().setOperator(AccountId.fromString(userProfile?.accountId), operatorKey)
      : Client.forMainnet().setOperator(AccountId.fromString(userProfile?.accountId), operatorKey);

    if (!hederaClient) {
      throw new Error("Hedera client is not initialized");
    }

    let transactionId = "";
    try {
      tx.freezeWith(hederaClient);
      const txSigned = await tx.sign(operatorKey);
      const txSubmit = await txSigned.execute(hederaClient);
      const receipt = await txSubmit.getReceipt(hederaClient);
      transactionId = txSubmit.transactionId.toString();

      if (!transactionId) {
        throw new Error("Transaction ID is undefined.`");
      }
      return transactionId;
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred';
      if (errorMessage?.includes("INSUFFICIENT_PAYER_BALANCE")) {
        console.log("INSUFFICIENT_PAYER_BALANCE");
        toast.error("Insufficient Balance");
      } else {
        toast.error("Transaction Failed!");
      }

    }
  };

  const mappedNFT = async () => {
    try {
      console.log("Starting mappedNFT function...");
      const profile = await fetchUserProfile(userProfile.accountId).unwrap();
      const ChipHash = profile?.signature;
      const messageHash = profile?.message_hash;
      console.log("ChipHash", ChipHash)
      console.log("messageHash", messageHash)

      const chipAddress = ethers.utils.verifyMessage(ethers.utils.arrayify(messageHash), ChipHash);
      //  const chipAddress = ethers.utils.verifyMessage(ethers.utils.arrayify("0x94dd52e56d30c98e02d5308df9594f84ae00ece3f816314f9f91a1ae963c3e35"), "0x05c1a152f5d7040c47448588c40458fac6fd0dc8178dfa6b789d8a86b2adb7b809b33ef5b10d8e3ed71860bdceae6aa9e505488328b1ae480d6f98595a44a98c1c");

      console.log("chipAddress nft method", chipAddress)

      const operatorKey = PrivateKey.fromStringDer(userPrivateKey);
      const hederaClient = process.env.NEXT_PUBLIC_HEDERA_NETWORK === 'testnet'
        ? Client.forTestnet().setOperator(AccountId.fromString(userProfile?.accountId), operatorKey)
        : Client.forMainnet().setOperator(AccountId.fromString(userProfile?.accountId), operatorKey);

      console.log("Hedera client initialized.");

      const maxFee = Hbar.fromTinybars(MAX_TRANSACTION_FEE * 200);
      const query = new ContractCallQuery()
        .setContractId("0.0.4650196")
        .setGas(TRANSACTION_GAS)
        .setMaxQueryPayment(maxFee)
        .setFunction("tokenIdMappedFor",
          new ContractFunctionParameters().addAddress(chipAddress)
        );

      const contractCallResult = await query.execute(hederaClient);
      const message = contractCallResult.getUint256(0);
      console.log("tokenIdMappedFor result:", message);

      const token_maxFee = Hbar.fromTinybars(MAX_TRANSACTION_FEE * 200);
      const token_query = new ContractCallQuery()
        .setContractId("0.0.4650196")
        .setGas(TRANSACTION_GAS)
        .setMaxQueryPayment(token_maxFee)
        .setFunction("tokenURI",
          new ContractFunctionParameters().addUint256(Number(message))
        );

      const tokeid_contractCallResult = await token_query.execute(hederaClient);
      const messagetoken = tokeid_contractCallResult.getString(0);
      console.log("tokenURI result:", messagetoken);

      if (message) {
        console.log("Fetching token metadata...");
        fetch(messagetoken)
          .then((response) => response.json())
          .then((result: Result) => {
            console.log("Token metadata fetched successfully:", result);
            setResult(result);
            setPreviewImage(result?.image)
            // console.log("messageHash", messageHash);
            createFreeNft({
              account_id: userProfile.accountId,
              name: result?.name,
              image: result?.image,
              video: result?.video,
              token_id: Number(message)
            });
            return result;
          })
          .catch((error) => console.error("Error fetching token metadata:", error));
      }
      return message;
    } catch (error) {
      console.error("Error in mappedNFT:", error);
    }
  };

  const TransactionHandler = async () => {
    try {
      setLoading(true);
      console.log("Starting TransactionHandler...");
      const profile = await fetchUserProfile(userProfile.accountId).unwrap();
      console.log("User profile fetched:", profile);

      const hexString = profile?.signature;
      const ChipHash = profile?.signature;
      const messageHash = profile?.message_hash;
      const blockNumber: number = profile.block_number;
      // console.log("Profile data:", { hexString, ChipHash, messageHash, blockNumber });

      const cleanedHexString = hexString.startsWith('0x') ? hexString.slice(2) : hexString;
      const byteArray = new Uint8Array(cleanedHexString.length / 2);
      for (let i = 0; i < cleanedHexString.length; i += 2) {
        byteArray[i / 2] = parseInt(cleanedHexString.substr(i, 2), 16);
      }
      console.log("Byte array created from hexString.");

      const chipAddress = ethers.utils.verifyMessage(ethers.utils.arrayify(messageHash), ChipHash);
      console.log("Chip address verified:", chipAddress);

      const chip_tx = new ContractExecuteTransaction()
        .setContractId("0.0.4650196")
        .setFunction(
          'tokenIdFor',
          new ContractFunctionParameters().addAddress(chipAddress)
        )
        .setGas(2_000_000)
        .setMaxTransactionFee(2_000_000);

      const chip_PopulateResponce: any = await populateAndRunTx(chip_tx);
      console.log("chip_PopulateResponce result:", chip_PopulateResponce);

      if (chip_PopulateResponce) {
        console.log("Executing error transaction...");
        const error_tx = new ContractExecuteTransaction()
          .setContractId("0.0.4650196")
          .setFunction(
            'transferTokenWithChip',
            new ContractFunctionParameters()
              .addBytes(byteArray)
              .addUint256(blockNumber)
          )
          .setGas(2_000_000)
          .setMaxTransactionFee(2_000_000);

        const error_PopulateResponce: any = await populateAndRunTx(error_tx);
        console.log("error_PopulateResponce result:", error_PopulateResponce);

        if (error_PopulateResponce) {
          console.log("Error transaction executed successfully.");
          await mappedNFT();
          toast.success("Transaction Successful");
          setStep(3);
        }
        return error_PopulateResponce;
      } else {
        console.log("Minting new token...");
        const minting_tx = new ContractExecuteTransaction()
          .setContractId("0.0.4650196")
          .setFunction(
            'mintPBT',
            new ContractFunctionParameters()
              .addBytes(byteArray)
              .addUint256(blockNumber)
          )
          .setGas(2_000_000)
          .setMaxTransactionFee(2_000_000);

        const minting_PopulateResponce: any = await populateAndRunTx(minting_tx);
        console.log("minting_PopulateResponce result:", minting_PopulateResponce);

        if (minting_PopulateResponce) {
          console.log("Minting transaction executed successfully.");
          await mappedNFT();
          toast.success("Transaction Successful");
          setStep(3);
        }
      }
    } catch (error: any) {
      console.error("Error in TransactionHandler:", error);

      if (error?.message?.includes("INSUFFICIENT_PAYER_BALANCE")) {
        console.log("INSUFFICIENT_PAYER_BALANCE");
        toast.error("Insufficient Balance");
      } else {
        toast.error("Transaction Failed!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async () => {
    setIsModalOpen(true);
    setIsLoading(true);
    const res = await generateQRCode();
    console.log("res ======>", res);
    setIsLoading(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setStep(1);
    if (intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }
  };

  const toSolidityAddress = (hederaAddress: any) => {
    const [shard, realm, num] = hederaAddress.split('.').map(Number);
    const hexNum = num.toString(16).padStart(40, '0');
    return `0x${hexNum}`;
  };

  const generateQRCode = async () => {
    const web3Provider = new Web3.providers.HttpProvider("https://testnet.hashio.io/api");
    const web3Instance = new Web3(web3Provider);

    try {
      const latestBlockNumber = await web3Instance.eth.getBlockNumber();
      const block = await web3Instance.eth.getBlock(latestBlockNumber);
      setBlockNumber(block.number.toString());

      const addr = toSolidityAddress(userProfile?.accountId);
      const blockHash = block.hash;

      const messageHash = web3Instance.utils.keccak256(
        web3Instance.utils.encodePacked(
          { value: addr, type: "address" },
          { value: blockHash, type: "bytes" }
        )
      );

      await updateBlockInfo({
        blockHash: block.hash ?? '',
        blockNumber: block.number.toString(),
        messageHash
      });

      const qrLink = `https://spheravaultnew-git-main-sphera1.vercel.app/?message=${messageHash}`;
      QRCodeGenerator.toDataURL(qrLink, (err: any, url: any) => {
        if (err) {
          console.error('Error generating QR code:', err);
        } else {
          setQrCodeUrl(url);
        }
      });

      intervalId.current = setInterval(async () => {
        const result = await checkSignature({ blockNumber: block.number.toString() }).unwrap();
        console.log("result.signatureExists", result.signatureExists);
        if (result.signatureExists) {
          clearInterval(intervalId.current!);
          intervalId.current = null;

          setSignatureFound(true);
          setClaimNFT(false);

          console.log("Check ownership start")
          const profile = await fetchUserProfile(userProfile.accountId).unwrap();
          const ChipHash = profile?.signature;
          const messageHash = profile?.message_hash;
          console.log("ChipHash", ChipHash)
          console.log("messageHash", messageHash)

          //const chipAddress = "0x3af1d724044df4841fed6f8c35438f0ce6f3c7b9";
          const chipAddress = ethers.utils.verifyMessage(ethers.utils.arrayify(messageHash), ChipHash);
          // const chipAddress = ethers.utils.verifyMessage(ethers.utils.arrayify("0x94dd52e56d30c98e02d5308df9594f84ae00ece3f816314f9f91a1ae963c3e35"), "0x05c1a152f5d7040c47448588c40458fac6fd0dc8178dfa6b789d8a86b2adb7b809b33ef5b10d8e3ed71860bdceae6aa9e505488328b1ae480d6f98595a44a98c1c");

          console.log("chipAddress", chipAddress)


          console.log("Funcation call")
          const operatorKey = PrivateKey.fromStringDer(userPrivateKey);
          const hederaClient = process.env.NEXT_PUBLIC_HEDERA_NETWORK === 'testnet'
            ? Client.forTestnet().setOperator(AccountId.fromString(userProfile?.accountId), operatorKey)
            : Client.forMainnet().setOperator(AccountId.fromString(userProfile?.accountId), operatorKey);

          console.log("Got Keys Funcation call")

          const maxFee = Hbar.fromTinybars(MAX_TRANSACTION_FEE * 200)
          const query = new ContractCallQuery()
            .setContractId("0.0.4650196")
            .setGas(TRANSACTION_GAS)
            .setMaxQueryPayment(maxFee)
            .setFunction("tokenIdMappedFor",
              new ContractFunctionParameters().addAddress(chipAddress)
            );

          const contractCallResult = await query.execute(hederaClient);
          const message = contractCallResult.getUint256(0);
          console.log(Number(message), "this is message1")



          const minting_owner = Hbar.fromTinybars(MAX_TRANSACTION_FEE * 200)
          const token_minting = new ContractCallQuery()
            .setContractId("0.0.4650196")
            .setGas(TRANSACTION_GAS)
            .setMaxQueryPayment(minting_owner)
            .setFunction("ownerOf",
              new ContractFunctionParameters().addUint256(Number(message))
            );

          const tokeidminting_contractCallResult = await token_minting.execute(hederaClient);
          const messagetokenminting = tokeidminting_contractCallResult.getAddress(0);
          console.log("minting owner result:", messagetokenminting)

          const account_id = parseInt(messagetokenminting, 16);

          userProfile?.accountId
          console.log("userProfile?.accountId" + userProfile?.accountId)

          const numberaccount: string = userProfile?.accountId.replace(/^0\.0\./, '');
          console.log("account_id" + account_id + "old one", numberaccount)
          if (Number(account_id) == Number(numberaccount)) {
            setClaimNFT(true);
            toast.warning("NFT already minted in your Account!")
          }

          setStep(2);
        }
      }, 5000);
    } catch (error) {
      toast.error("Transaction Failed.")
      console.error('Error fetching the latest block:', error);
    }
  };

  useEffect(() => {
    if (userProfile.accountId) {
      getNftClaim({ accountId: userProfile.accountId })
        .unwrap()
        .then(setNftClaim)
        .catch(console.error);
    }
  }, [userProfile.accountId]);


  const NfttoggleModal = () => {
    if (nftClaim?.image) {
      console.log("NfttoggleModal triggered");
      setIsNftModalOpen(!isNftModalOpen);
    } else {
      console.log("No image available. Modal will not open.");
    }
  };


  return (
    <div className="w-[100%] px-[80px]">
    <div className="flex justify-between py-[20px] items-start mt-12">
        <div className='flex flex-col'>
          <h2 className="text-[18px]  mb-[5px] ml-6 font-blackHanSans font-bold  text-center pb-2">sPOINT BALANCE:</h2>
          <div
            style={{
              borderRadius: "15px",
              borderTop: "2px inset #fff",
              border: '2px solid gray',
              backgroundColor: "#4D4D4D",
              padding: "20px 38px",
              boxShadow: "rgba(0, 0, 0, 0.5) 5px 10px 15px inset",
              height: "fit-content",
              lineHeight: "40px",
              width: "400px",
            }}
          >
            {/* <h2 className="text-[32px] font-extrabold">sPOINTS:</h2> */}
            <h2 style={{ textShadow: "-1px 3px 5px #05EE54", color: "#05EE54", fontSize: '30px', fontWeight: "1000",textAlign:"center" }}>{userProfile.total_spoint}</h2>
          </div>
        </div>

        <div>
          <h2 className="text-[18px] mb-[5px] pr-[40px] font-blackHanSans font-bold uppercase ml-6">BADGES</h2>
          <div className="flex items gap-6 bg-[#4D4D4D] px-[44px] py-[20px]"
            style={{
              borderRadius: "15px",
              borderTop: "2px inset #fff",
              border: '2px solid gray',
              backgroundColor: "#4D4D4D",
              padding: "20px 38px",
              boxShadow: "rgba(0, 0, 0, 0.5) 5px 10px 15px inset",
              height: "fit-content",
              lineHeight: "40px",
            }}
          >
            <div className="flex space-x-5 mt-2">
              <img className="w-[70px] h-[80px]" alt="achieve" src={Ach4.src} />
            </div>
            <div className="flex space-x-5 mt-2">
              <img className="w-[70px] h-[80px]" alt="achieve" src={Ach1.src} />
            </div>
            <div className="flex space-x-5 mt-2">
              <img className="w-[70px] h-[80px]" alt="achieve" src={Ach2.src} />
            </div>
            <div className="flex space-x-5 mt-2">
              <img className="w-[70px] h-[80px]" alt="achieve" src={Ach2.src} />
            </div>
            <div className="flex space-x-5 mt-2">
              <img className="w-[70px] h-[80px]" alt="achieve" src={Ach3.src} />
            </div>
          </div>
        </div>
      </div>

      {/* <button onClick={TransactionHandler}>TransactionHandler</button> */}

      <div className='w-full flex justify-between items-center mt-12'>
        <h2 className="text-[18px] mb-[5px] pr-[40px] font-blackHanSans font-bold uppercase ml-6">SPHERA VAULT</h2>
         {/* <h2 className="text-[18px] mb-[5px] pr-[40px] font-blackHanSans font-bold uppercase ml-6">VIEW ALL</h2>  */}
      </div>
      <div className="flex items gap-6 bg-[#4D4D4D] "
        style={{
          borderRadius: "15px",
          borderTop: "2px inset #fff",
          border: '2px solid gray',
          backgroundColor: "#353535",
          padding: "20px 38px",
          boxShadow: "rgba(0, 0, 0, 0.5) 5px 10px 15px inset",
          height: "fit-content",
          lineHeight: "40px",
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div className="flex items-center gap-2">
          <img src={FingerPrint.src} alt="Finger Print" width={"140px"} height={"140px"} className="cursor-pointer" onClick={handleOpenModal} />
          <div className="leading-[25px]">
            <h3 className="font-extrabold text-[20px]">S-CONNECT</h3>
            <p className='w-[200px] text-[14px] font-thin leading-tight'>BOND A PHYSICAL ITEM TO YOUR WALLET TO PROVE YOUR OWNERSHIP.</p>
          </div>
        </div>

        <div className="flex justify-between items-end gap-[38px]">
          <div className="flex items-center gap-4">
            {nftClaim?.image ?
              <div className="flex items gap-6 bg-[#4D4D4D] "
                style={{
                  borderRadius: "30px",
                  borderTop: "2px inset #fff",
                  border: '2px solid gray',
                  backgroundColor: "#4d4d4d",
                  padding: "5px",
                  boxShadow: "rgba(0, 0, 0, 0.5) 5px 10px 15px inset",
                  height: "fit-content",
                  lineHeight: "40px",
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  overflow: "hidden"
                }}
                onClick={NfttoggleModal}
              >
                <img
                  src={nftClaim.image}
                  alt=""
                  width={"130px"}
                  className="w-[130px] h-[120px] object-contain border-none outline-none"
                />
              </div>
              :
              <img src={empthigh.src} alt="" width={"130px"} />
            }
            <img src={empthigh.src} alt="" width={"130px"} />
            <img src={empthigh.src} alt="" width={"130px"} />
          </div>
        </div>
      </div>

      {/* <button onClick={() => window.location.reload()}>TransactionProfiler</button> */}

      <Modal show={isModalOpen} onClose={handleCloseModal} width="w-[400px]" className="w-[350px] h-[450px]">
        <div className='w-full flex justify-between items-center py-4 px-6 '>
          <IoReload className='cursor-pointer' style={{ color: '#fff' }} />
          <p className='text-[#fff] text-[16px] font-medium'>SCAN QR CODE</p>
          <RxCross2 className='cursor-pointer' onClick={handleCloseModal} style={{ color: '#fff' }} />
        </div>
        <div className="flex items-center justify-between w-full px-6 mb-4">
          <div className="flex items-center">
            <div className="w-7 h-7 bg-orange text-white rounded-full flex items-center justify-center">1</div>
            <div className="w-[90px] h-[2px] bg-white flex-grow mx-2"></div>
          </div>
          <div className="flex items-center">
            <div className={`w-7 h-7 ${signatureFound ? 'bg-orange' : 'bg-gray-700'} text-white rounded-full flex items-center justify-center`}>2</div>
            <div className="w-[90px] h-[2px] bg-white flex-grow mx-2"></div>
          </div>
          <div className="flex items-center">
            <div className={`w-7 h-7 ${step === 3 ? 'bg-orange' : 'bg-gray-700'} text-white rounded-full flex items-center justify-center`}>3</div>
          </div>
        </div>
        <p className="text-center text-[10px] m-auto mb-[20px] text-white">To begin the PBT process, scan the QR code and follow the <br /> instructions on your mobile device. Keep your browser open.</p>
        <div className="flex justify-center">
          {isLoading ? (
            <div className="h-[280px] min-w-[280px] flex items-center justify-center">
              <div className={`${styles.loader}`} style={{ color: '#fff' }}></div>
            </div>
          ) : (
            !signatureFound && (
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="h-[280px] min-w-[280px] rounded-xl"
              />
            )
          )}
        </div>
        {signatureFound && step !== 3 && (
          <div className="flex flex-col justify-center items-center gap-4 mt-4">
            <img src="image.png" alt="" className='w-[180px]' />
            <button
              onClick={TransactionHandler}
              disabled={loading || claimNft}
              className={`px-4 py-2 rounded w-[70%] ${loading || claimNft ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange text-black'
                }`}
            >
              {
                loading ? "Loading..." : (claimNft ? "Claim NFT" : "Claim NFT")
              }
            </button>
          </div>
        )}
        {step === 3 && (
          <div className="flex flex-col justify-center items-center gap-4 mt-4">
            <img src={`${previewImage}`} alt="" className='w-[180px] h-[170px] object-contain' />
            <button className="bg-orange text-black px-4 py-2 rounded w-[80%] m-auto mt-[10px]" onClick={() => window.location.reload()}>View Profile</button>
          </div>
        )}
      </Modal>

      {isNftModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 mt-24">
          <div className="bg-[#000] p-4 rounded-lg shadow-lg w-[400px] h-[500px] relative" style={{ boxShadow: "0px 0px 4px 4px #ffa50099", borderRadius: '15px', border: "2px solid #fff" }}>
            <button
              onClick={NfttoggleModal}
              className="absolute top-2 right-2 text-white text-2xl"
            >
              &times;
            </button>
            <video
              loop
              autoPlay
              className="w-full h-full object-contain"
            >
              <source src={nftClaim?.video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </div >
  );
};

export default UserIdInfo;

