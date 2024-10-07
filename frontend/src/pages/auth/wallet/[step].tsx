'use client'
import { useUser } from '@/providers/user.provider';
import WalletContainer from "@/components/Auth/WalletContainer";
import WalletForm from "@/components/Auth/WalletForm";
import Button from "@/components/Common/Button";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/router';
import MoonPayLogo from "public/img/auth/wallet/moon-pay-logo.png";
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSidePropsContext } from 'next/types';
import styles from '../styles.module.scss';
import { BladeSDK } from "@bladelabs/blade-sdk.js";
import { useState } from "react";
import { FiCopy as CopyIcon } from "react-icons/fi";
import { toast } from "react-toastify";
import Sport from '@/public/sport.png'
import Logo from '@/public/logo.png'
import { BsBoxArrowInDownLeft } from "react-icons/bs";
import { CiEdit } from "react-icons/ci";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { CiLock } from "react-icons/ci";
import { LuClipboardList } from "react-icons/lu";
import { useSaveAccountIdMutation } from "@/api/userApi";
import { Client, Hbar, TransferTransaction, ContractCallQuery, AccountId, PrivateKey, ContractFunctionParameters, ContractExecuteTransaction } from "@hashgraph/sdk"
import { MAX_TRANSACTION_FEE, TRANSACTION_GAS } from "@/constants/app.constants";
import { ethers } from 'ethers';
import { hexToBytes } from "web3-utils";
import { useAppDispatch } from '@/hooks/app';

interface AccountInfo {
    accountId: string;
    evmAddress: string;
    privateKey: string;
    publicKey: string;
    seedPhrase: string;
}

interface Props {
    step: string;
    t: (key: string) => string;
}

const Wallet = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { t } = useTranslation();
    const step = router.query.step;
    const { setOpenMoonPay } = useUser();
    const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
    const [seedPhrase, setSeedPhrase] = useState(Array(12).fill(''));
    const [isLoading, setIsLoading] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [SeedPhraseDialog, setSeedPhraseDialog] = useState(false);
    const [IntructionDialog, setIntructionDialog] = useState(false);
    const [PrivateKeyDialog, setPrivateKeyDialog] = useState(false);
    const [hideSeedPhrase, setHideSeedPhrase] = useState(true);
    const [isChecked, setIsChecked] = useState(false);

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
    };

    const [mintSbt, setMintSbt] = useState(false);
    const [wannaMint, setWannaMint] = useState(false);

    const populateAndRunTx = async (tx: any, accountId: any, privateKey: any): Promise<string> => {
        if (!accountId || !privateKey) {
            throw new Error("Account ID or Private Key is not set");
        }

        const operatorKey = PrivateKey.fromStringDer(privateKey);
        const hederaClient = process.env.NEXT_PUBLIC_HEDERA_NETWORK === 'testnet'
            ? Client.forTestnet().setOperator(AccountId.fromString(accountId), operatorKey)
            : Client.forMainnet().setOperator(AccountId.fromString(accountId), operatorKey);

        if (!hederaClient) {
            throw new Error("Hedera client is not initialized");
        }

        let transactionId = "";
        try {
            setIsLoading(true);
            tx.freezeWith(hederaClient);
            const txSigned = await tx.sign(operatorKey);
            const txSubmit = await txSigned.execute(hederaClient);
            const receipt = await txSubmit.getReceipt(hederaClient);
            transactionId = txSubmit.transactionId.toString();
            if (!transactionId) {
                throw new Error("Transaction ID is undefined");
            }
            return transactionId;
        } catch (err) {
            const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred';
            console.error(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // User Credentials
    const myAccountId = "0.0.3562965";
    const myPrivateKey = "302e020100300506032b657004220420b2597f0e0146e951fc93c5e9463b1d8469a25f84c44913ab3ea477c9cd6e75f7";
    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);
    client.setDefaultMaxTransactionFee(new Hbar(100));
    client.setMaxQueryPayment(new Hbar(50));

    const signatureFromBackend = async (accountId: any, privateKey: any) => {
        const Nonce: any = await getNonce(accountId);
        const provider = new ethers.providers.JsonRpcProvider("https://testnet.hashio.io/api");
        let backendWallet = new ethers.Wallet("0x56a76bd58deabbb90a2c46c7217dc9c6705aed6f5e99352898cb22c2419d9202");
        backendWallet = backendWallet.connect(provider);

        const abi = ethers.utils.defaultAbiCoder;
        const accid = AccountId.fromString(accountId).toSolidityAddress();
        const ba = "0x" + accid;
        const encodedMessage = abi.encode(["address", "uint256", "uint256"], [ba, 2, Nonce]);
        const messageHash = ethers.utils.keccak256(encodedMessage);
        const bytesArray = ethers.utils.arrayify(messageHash);
        const signature = await backendWallet.signMessage(bytesArray);
        const signature1 = ethers.utils.splitSignature(signature);
        const { r, s, v } = signature1;
        let a = hexToBytes(r);
        let b = hexToBytes(s);

        const tx: any = new ContractExecuteTransaction()
            .setContractId("0.0.4255544")
            .setFunction('mint', new ContractFunctionParameters().addUint256(2).addBytes32(a).addBytes32(b).addUint8(v))
            .setGas(TRANSACTION_GAS)
            .setMaxTransactionFee(MAX_TRANSACTION_FEE);
        return await populateAndRunTx(tx, accountId, privateKey);
    };

    const toggleDetails = () => {
        setPrivateKeyDialog(true);
    };

    const handleChange = (index: any, value: any) => {
        const newSeedPhrase: any = [...seedPhrase];
        newSeedPhrase[index] = value;
        setSeedPhrase(newSeedPhrase);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const isComplete = seedPhrase.every((word) => word.trim() !== '');
        if (!isComplete) {
            alert('Please fill in all the input fields.');
            return;
        }

        const localStorageData = JSON.parse(localStorage.getItem('walletAccount') || '{}');
        const localStorageSeedPhrase = localStorageData.seedPhrase;
        const isSeedPhraseMatch = seedPhrase.join(' ') === localStorageSeedPhrase;

        if (isSeedPhraseMatch) {
            const seedPhraseString = seedPhrase.join(' ');
            const result = await bladeSDK.getKeysFromMnemonic(seedPhraseString, true);
            console.log("result", result);
        } else {
            alert('Seed phrase does not match. Please check your inputs.');
        }
    };

    // make object from BladeSDK
    const bladeSDK = new BladeSDK();
    bladeSDK.init("IX6IEUJLn4qqKWbbgQkAnArBzwbcNIQ4IYejRnEXEZSfzJ7eFLuqa5QKIvpZqmzn", "testnet", "spherawebsdk82673", "A4zJtfARB2ks3JXDxnpt");
    const [saveAccountId] = useSaveAccountIdMutation();

    const createWalletAccount = async () => {
        if (!isChecked) {
            toast.warning("If you want to create new account agree the terms and condition of spheraworld");
            return;
        }

        setIsLoading(true);
        const createAccount = await bladeSDK.createAccount();
        console.log("createAccount",createAccount);
        if (createAccount.accountId) {
            const load: any = 0;
            localStorage.setItem('walletAccount', JSON.stringify(createAccount));
            localStorage.setItem('walletAccount_id', createAccount.accountId);
            localStorage.setItem('walletAccount_privateKey', createAccount.privateKey);
            localStorage.setItem('isFirstLoad', load);
            localStorage.setItem('showFirstLoad', "1");
            const sendHbar = await new TransferTransaction()
                .addHbarTransfer(myAccountId, Hbar.fromTinybars(-5000000000)) // Sending account
                .addHbarTransfer(createAccount.accountId, Hbar.fromTinybars(5000000000)) // Receiving account
                .execute(client);
            // const response = await saveAccountId({ accountId: createAccount?.accountId.toString() });
            const response = await saveAccountId({
                accountId: createAccount.accountId.toString(),
                evmAddress: createAccount.evmAddress.toLowerCase()
            });
            setAccountInfo(createAccount as AccountInfo);
            await mintNewUseNftHandler(createAccount.accountId, createAccount.privateKey);
            toast.success("New Achievement Unlocked");
        }
        setIsLoading(false);
    };

    const formatPublicKey = (publicKey: any) => {
        return `${publicKey.slice(0, 10)}...${publicKey.slice(-4)}`;
    };

    const closePopup = () => {
        setAccountInfo(null);
        setPrivateKeyDialog(false);
        setIntructionDialog(false);
        setSeedPhraseDialog(false);
        router.push('/auth/wallet/connected');
    };

    const handleCopyAccountId = (data: any) => {
        navigator.clipboard.writeText(data)
            .then(() => { toast.success("Text copied to clipboard"); })
            .catch((error) => { console.error("Failed to copy:", error); });
    };

    const operatorKey = PrivateKey.fromStringDer("3030020100300706052b8104000a0422042056a76bd58deabbb90a2c46c7217dc9c6705aed6f5e99352898cb22c2419d9202");
    const hederaClient = process.env.NEXT_PUBLIC_HEDERA_NETWORK === 'testnet'
        ? Client.forTestnet().setOperator(AccountId.fromString("0.0.3706195"), operatorKey)
        : Client.forMainnet().setOperator(AccountId.fromString("0.0.3706195"), operatorKey);

    const currentlyMinted = async () => {
        const maxFee = Hbar.fromTinybars(MAX_TRANSACTION_FEE * 130);

        const query = new ContractCallQuery()
            .setContractId("0.0.4256713")
            .setGas(TRANSACTION_GAS)
            .setMaxQueryPayment(maxFee)
            .setFunction("_totalSupply");
        const contractCallResult = await query.execute(hederaClient);
        const message = contractCallResult.getUint256(0);
        return Number(message) <= 1000 ? true : false;
    };

    const getUserInfo = async (accountId: any) => {
        const maxFee = Hbar.fromTinybars(MAX_TRANSACTION_FEE * 120);

        const AccId = AccountId.fromString(accountId).toSolidityAddress();
        const query = new ContractCallQuery()
            .setContractId("0.0.4256713")
            .setGas(TRANSACTION_GAS)
            .setMaxQueryPayment(maxFee)
            .setFunction("balanceOf", new ContractFunctionParameters().addAddress("0x" + AccId));
        const contractCallResult = await query.execute(hederaClient);
        const message = contractCallResult.getUint256(0);
        return Number(message) <= 1 ? true : false;
    };

    const getNonce = async (accountId: any) => {
        const maxFee = Hbar.fromTinybars(MAX_TRANSACTION_FEE * 120);
        const evmAddress = AccountId.fromString(accountId).toSolidityAddress();
        const query = new ContractCallQuery()
            .setContractId("0.0.4255544")
            .setGas(TRANSACTION_GAS)
            .setMaxQueryPayment(maxFee)
            .setFunction("nonce", new ContractFunctionParameters().addUint256(2).addAddress(evmAddress));
        const contractCallResult = await query.execute(hederaClient);
        const message = contractCallResult.getUint256(0);
        return Number(message);
    };

    const mintNewUseNftHandler = async (accountId: any, privateKey: any) => {
        const mintingLimit = await currentlyMinted();
        const balance = await getUserInfo(accountId);

        if (mintingLimit && balance) {
            await signatureFromBackend(accountId, privateKey);
        }
    };

    return (
        <>
            <WalletContainer
                pageTitle={t("common:wallet")}
                leftSideFirstHeader={{
                    text: t("auth:connecting_to")
                }}
                leftSideSecondHeader={{
                    text: t("auth:web3"),
                    classNames: "text-orange"
                }}
                leftSideDescription={{
                    text: t("auth:chose_how_you_would_like_to_connect")
                }}
            >
                <WalletForm>
                    {step === 'start' &&
                        <div className="flex flex-col w-72">
                            <p className="font-abz text-3xl text-white">{t("auth:select_wallet_setup")}</p>
                            <p className="font-thin text-base mt-4 text-white">{t("auth:to_fully_access_the_sphera_world_platform")}</p>
                            <Button
                                className="mt-8 px-8 rounded font-extralight w-48 text-center"
                                onClick={() => { router.push('/auth/wallet/hedera-setup') }}
                                label={t("common:next")}
                            />
                        </div>
                    }
                    {step === 'hedera-setup' &&
                        <div className="flex flex-col items-center relative">
                            <div className="flex flex-col">
                                <p className="font-abz text-3xl text-white">{t("auth:hedera_wallet_setup")}</p>
                                <p className="font-thin text-base mt-4 text-white w-72">{t("auth:to_fully_access_the_sphera_world_platform")}</p>
                                <Button
                                    className="mt-8 px-8 rounded font-extralight w-48 text-center"
                                    onClick={() => { router.push('/auth/wallet/select') }}
                                    label={t("common:next")}
                                />
                            </div>
                            <Image
                                quality={100}
                                src="/img/auth/wallet/hedera-logo.png"
                                alt="hedera"
                                width={235}
                                height={90}
                                className={`${styles.hederaLogo}`}
                            />
                        </div>
                    }
                    {step === 'select' &&
                        <>
                            <div className="flex flex-col">
                                <div className="flex flex-col">
                                    <div className="w-full flex flex-col items-center justify-center">
                                        <Image alt="image" src={Sport} className="object-contain w-[180px] h-[120px]" />
                                    </div>
                                    <p className="text-[18px] w-full text-center">To get started, create new wallet or import one <br /> from a seed phrase</p>
                                    <div className='w-full flex flex-col items-center gap-4 mt-[120px]'>
                                        <button
                                            onClick={() => { router.push('/auth/wallet/connect') }}
                                            className='w-[350px] p-4 border-2 border-orange rounded-md bg-[#2A1200] flex items-center justify-center'>
                                            <span className='mr-[10px]'><BsBoxArrowInDownLeft color='#E27625' size={23} /></span> Import Existing Wallets
                                        </button>
                                        <button
                                            onClick={createWalletAccount}
                                            disabled={isLoading}
                                            className='w-[350px] p-4 border-2 border-orange rounded-md bg-[#2A1200] flex items-center justify-center'>
                                            <span className='mr-[10px]'><CiEdit color='#E27625' size={28} /></span>
                                            {isLoading ? "Creating..." : "Create New Wallet"}
                                        </button>
                                    </div>
                                    <p className="text-[18px] w-full text-center mt-4 font-thin">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox text-[#E27625] border-[#E27625] appearance-none bg-transparent checked:border-transparent checked:text-[#E27625] checked:bg-[#E27625] h-5 w-5 border-2 border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                                                style={{ border:'1px solid orange' }}
                                                checked={isChecked}
                                                onChange={handleCheckboxChange}
                                            />
                                            <span className="ml-2">I agree to the <span className='text-orange'>Terms of service</span></span>
                                        </label>
                                    </p>
                                </div>
                            </div>

                            {accountInfo && (
                                <div className="w-full h-full absolute top-[0] left-[0] flex justify-center items-center" style={{ zIndex: 9999999 }}>
                                    <div className="w-full h-full absolute top-0 left-0 bg-opacity-50"></div>
                                    <div className="bg-black p-4 rounded-lg w-[870px] z-10">
                                        <div className='relative'>
                                            <button onClick={() => { setAccountInfo(null); closePopup() }} className="absolute top-1 right-2 text-white text-xl">&times;</button>
                                        </div>
                                        <div className="w-full flex flex-col items-center justify-center">
                                            <Image alt="image" src={Logo} className="object-cover w-[160px] h-[60px]" />
                                        </div>
                                        <h2 className="w-full text-center font-medium text-[32px] my-3 text-white">Account Created</h2>
                                        <h2 className="w-[70%] m-auto text-center text-md mt-2 text-white-600 text-orange">This will be the wallet used to <br /> interact with the sphera platform.</h2>
                                        <ul className="my-12 w-full flex flex-col justify-center items-center gap-2">
                                            <li className='w-[350px] flex items-center justify-center p-6 border-2 border-orange rounded-md text-[18px] font-thin gap-4' style={{ border: "1px solid #FF7F2A" }}><p className=''>Account ID: </p><span className="text-[14px]">{accountInfo.accountId}</span></li>
                                            <li className='w-[350px] flex items-center justify-center p-6 border-2 border-orange rounded-md  text-[18px] font-thin gap-2' style={{ border: "1px solid #FF7F2A" }}><p className=''>Ethereum Address:  </p><span className="text-[14px]">{formatPublicKey(accountInfo.evmAddress)}</span></li>
                                        </ul>
                                        <div className="flex flex-col justify-center items-center gap-3 mt-2">
                                            <button onClick={() => setIntructionDialog(true)} className="bg-orange text-black w-[calc(100%_-_220px)] py-2 rounded">Secure Your Wallet</button>
                                        </div>
                                    </div>
                                    {IntructionDialog && (
                                        <div className="w-full h-full absolute top-[0] left-[0] flex justify-center items-center" style={{ zIndex: 9999999 }}>
                                            <div className="w-full h-full absolute top-0 left-0 bg-black bg-opacity-50"></div>
                                            <div className="bg-black p-4 rounded-lg w-[870px] z-10">
                                                <div className='relative'>
                                                    <button onClick={() => {
                                                        setIntructionDialog(false);
                                                    }} className="absolute top-1 left-2 text-white text-xl">&lt;</button>
                                                </div>
                                                <div className="w-full flex flex-col items-center justify-center">
                                                    <Image alt="image" src={Logo} className="object-cover w-[160px] h-[60px]" />
                                                </div>
                                                <h2 className="w-full text-center font-normal text-[18px] my-3 mt-16 text-white">Instructions for backing up your <br /> recovery phrase</h2>
                                                {/* first  */}
                                                <div className='w-[500px] m-auto p-4 h-[60px] bg-[#2A1200] rounded-lg flex  items-center'>
                                                    <div className='w-[40px] h-full flex justify-center items-center '>
                                                        <IoEyeOutline color='#FF9E55' size={25} />
                                                    </div>
                                                    <div className='flex flex-col items-start ml-4'>
                                                        <p className='text-[15px] font-thin'>Write it down in private</p>
                                                        <p className='text-[13px] font-thin text-orange'>Make sure your phrase isn’t seen by anyone.</p>
                                                    </div>
                                                </div>
                                                {/* second  */}
                                                <div className='w-[500px] m-auto p-4 h-[60px] bg-[#2A1200] rounded-lg flex  items-center my-6'>
                                                    <div className='w-[40px] h-full flex justify-center items-center '>
                                                        <CiLock color='#FF9E55' size={25} />
                                                    </div>
                                                    <div className='flex flex-col items-start ml-4'>
                                                        <p className='text-[15px] font-thin'>Keep it somewhere safe</p>
                                                        <p className='text-[13px] font-thin text-orange'>Anyone who finds it can access your wallet.</p>
                                                    </div>
                                                </div>
                                                {/* third  */}
                                                <div className='w-[500px] m-auto p-4 h-[60px] bg-[#2A1200] rounded-lg flex  items-center'>
                                                    <div className='w-[40px] h-full flex justify-center items-center '>
                                                        <LuClipboardList color='#FF9E55' size={25} />
                                                    </div>
                                                    <div className='flex flex-col items-start ml-4'>
                                                        <p className='text-[15px] font-thin'>Don’t lose it</p>
                                                        <p className='text-[13px] font-thin text-orange'>If you do, you won’t be able to recover your assets.</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col justify-center items-center gap-3 mt-6">
                                                    <button onClick={() => {
                                                        setSeedPhraseDialog(true);
                                                        setIntructionDialog(false);
                                                    }} className="bg-orange text-black w-[calc(100%_-_220px)] py-2 rounded">Continue</button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {SeedPhraseDialog && (
                                        <div className="w-full h-full absolute top-[0] left-[0] flex justify-center items-center" style={{ zIndex: 9999999 }}>
                                            <div className="w-full h-full absolute top-0 left-0 bg-black bg-opacity-50"></div>
                                            <div className="bg-black p-4 rounded-lg w-[870px] z-10">
                                                <div className='relative'>
                                                    <button onClick={() => {
                                                        setSeedPhraseDialog(false);
                                                        setIntructionDialog(true);
                                                    }} className="absolute top-1 left-2 text-white text-xl">&lt;</button>
                                                </div>
                                                <h2 className="w-full text-center font-normal text-[18px] my-3 mt-12 text-white">Write down your recovery <br /> phrase in order</h2>
                                                <h2 className="w-full text-center font-normal text-[13px] my-3 mt-1 text-orange">Remember to record your worlds in the same order as <br /> they appear below.</h2>

                                                <div className='w-[490px] m-auto mt-8'>
                                                    {
                                                        hideSeedPhrase && (
                                                            <div className='w-full m-auto absolute top-[200px] left-0 h-[178px] backdrop-filter backdrop-blur-lg'>
                                                                <div className="w-full h-[230px] flex justify-center items-center">
                                                                    <IoEyeOffOutline className="cursor-pointer" color="#fff" size={30} onClick={() => setHideSeedPhrase(false)} />
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                    {
                                                        [...Array(4)].map((_, rowIndex) => (
                                                            <div key={rowIndex} className='w-full flex gap-4 justify-between items-center mt-2'>
                                                                {[...Array(3)].map((_, colIndex) => {
                                                                    const wordIndex = rowIndex * 3 + colIndex;
                                                                    const word = accountInfo.seedPhrase.split(' ')[wordIndex];
                                                                    return (
                                                                        <div key={colIndex} className='w-[130px] px-2 pt-1 h-[34px] border-[1px] border-orange rounded-md curl'>
                                                                            <span className='text-orange'>{wordIndex + 1}.</span> {word}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ))
                                                    }
                                                    <div className='mt-12 flex justify-between items-center'>
                                                        <label className="inline-flex items-center">
                                                        </label>
                                                        <p className='text-white text-[13px] border-2 border-gray-700 rounded-md flex items-center justify-center px-4 py-2 cursor-pointer' onClick={() => handleCopyAccountId(accountInfo.seedPhrase)}>Copy <CopyIcon className="ml-2 cursor-pointer text-orange" size={14} /></p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col justify-center items-center gap-3 mt-4">
                                                    <button onClick={() => {
                                                        setIntructionDialog(false);
                                                        setSeedPhraseDialog(false);
                                                        setPrivateKeyDialog(true);
                                                    }} className="w-[calc(100%_-_220px)] bg-orange text-black py-2 rounded">
                                                        Continue
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {PrivateKeyDialog && (
                                        <div className="w-full h-full absolute top-[0] left-[0] flex justify-center items-center" style={{ zIndex: 9999999 }}>
                                            <div className="w-full h-full absolute top-0 left-0 bg-black bg-opacity-50"></div>
                                            <div className="bg-black p-4 rounded-lg w-[870px] z-10">
                                                <div className='relative'>
                                                    <button onClick={() => {
                                                        setSeedPhraseDialog(true);
                                                        setPrivateKeyDialog(false);
                                                    }} className="absolute top-1 left-2 text-white text-xl">&lt;</button>
                                                </div>

                                                <div className="w-full flex flex-col items-center justify-center">
                                                    <Image alt="image" src={Logo} className="object-cover w-[160px] h-[60px]" />
                                                </div>
                                                <h2 className="w-full text-center font-normal text-[18px] my-3 mt-6 text-white">Write down your Private Key.</h2>
                                                <h2 className="w-full text-center font-normal text-[13px] my-3 mt-3 text-white">Remember to record your Key in the same as they appear below.</h2>
                                                <h2 className="w-full text-center font-normal text-[13px] my-3 mt-3 text-orange">Warning: To access your wallet on additional devices you will need to import your private key <br /> when signing in from the new device.</h2>
                                                <div className='w-[490px] m-auto mt-12 bg-gray-700 rounded-lg h-[200px] flex flex-col px-4 py-2'>
                                                    <p className='w-full m-auto bg-slate-600 h-[100px] rounded-lg p-2 break-all text-[14px]'>{accountInfo.privateKey}</p>
                                                    <div className='mt-4 flex justify-between items-center'>
                                                        <label className="inline-flex  items-center">
                                                        </label>
                                                        <p className='text-white text-[13px] border-2 border-black rounded-md flex items-center justify-center px-4 py-2 cursor-pointer' onClick={() => handleCopyAccountId(accountInfo.privateKey)}>Copy <CopyIcon className="ml-2 cursor-pointer text-orange" size={14} /></p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col justify-center items-center gap-3 mt-4">
                                                    <button onClick={closePopup} className="w-[calc(100%_-_220px)] bg-orange text-black py-2 rounded">Continue</button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    }
                    {step === 'connect' && (
                        <div className="flex flex-col items-center relative">
                            <div className="flex flex-col">
                                <p className="font-abz text-3xl text-white">{t('auth:connect_existing_wallet')}</p>
                                <p className="font-thin text-base mt-4 text-white w-72">{t('auth:connect_your_existing_wallet')}</p>
                                <div className="walletsBtnWrapper">
                                    <form onSubmit={handleSubmit}>
                                        <div className="w-[500px] flex flex-col gap-2 mt-2">
                                            {[...Array(3)].map((row, rowIndex) => (
                                                <div key={rowIndex} className="flex justify-between items-center gap-2">
                                                    {[...Array(4)].map((_, index) => (
                                                        <input
                                                            key={index}
                                                            type="text"
                                                            name={`seed${rowIndex * 4 + index + 1}`}
                                                            value={seedPhrase[rowIndex * 4 + index]}
                                                            onChange={(e) => handleChange(rowIndex * 4 + index, e.target.value)}
                                                            required
                                                            className="w-1/4 bg-gray-800 text-white rounded-md"
                                                        />
                                                    ))}
                                                </div>
                                            ))}
                                            <button type="submit" className="mt-4 bg-orange text-white rounded-md p-2">Import Wallet</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'connected-moonpay' &&
                        <div className="flex flex-col items-center relative">
                            <div className="flex flex-col">
                                <p className="font-abz text-3xl text-white">{t("auth:wallet_connected_succesfully")}</p>
                                <p className="font-thin text-base mt-4 text-white w-72">{t("auth:congratulations_your_account_is_now_created")}</p>
                                <div className='flex gap-x-2 items-center justify-center mt-8'>
                                    <Button
                                        className="px-8 rounded font-extralight w-48 text-center"
                                        onClick={() => { setOpenMoonPay(true) }}
                                        label={t("common:top_up")}
                                    />
                                    <Link href="https://www.moonpay.com/learn" target='blank' >
                                        <Button className="px-8 rounded font-extralight w-48 text-center" label={t("common:tutorial")} />
                                    </Link>
                                    <Link className="font-extralight mb-2 text-base text-white" href='/auth/wallet/connected'>{t("common:skip")}</Link>
                                </div>
                                <div className="flex mt-2">
                                    <p className="font-extralight text-base text-white mr-2">{t("auth:powered_by")}:</p>
                                    <Image src={MoonPayLogo.src} alt="moonpay" width={113} height={21} />
                                </div>
                            </div>
                        </div>
                    }
                    {step === 'connected' &&
                        <div className="flex flex-col items-center relative">
                            <div className="flex flex-col">
                                <p className="font-abz text-3xl text-white">{t("auth:wallet_connected_succesfully")}</p>
                                <p className="font-thin text-base mt-4 text-white w-72">{t("auth:congratulations_your_account_is_now_created")}</p>
                                <div className='flex gap-x-2 items-center'>
                                    <Button
                                        className="mt-8 px-8 rounded font-extralight w-48 text-center"
                                        onClick={() => { router.push('/profile') }}
                                        label={t("auth:visit_profile")}
                                    />
                                    <Link href="https://discord.com/invite/CwM2H5GUcR" target='blank' >
                                        <Button
                                            className="mt-8 px-8 rounded font-extralight w-48 text-center"
                                            label={t("auth:join_community")}
                                        />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    }
                </WalletForm>
            </WalletContainer>
        </>
    );
};

export default Wallet;

export const getServerSideProps = async ({ locale = 'en' }: GetServerSidePropsContext) => ({
    props: {
        ...(await serverSideTranslations(locale, [
            'auth',
            'common'
        ])),
    },
});