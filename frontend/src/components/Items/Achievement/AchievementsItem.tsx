import React, { useCallback, useEffect, useState } from "react";
import { NftAchievement } from "@/types/blockchain.type";
import { AccountId, Client, ContractCallQuery, ContractFunctionParameters, Hbar, PrivateKey } from "@hashgraph/sdk";
import { MAX_TRANSACTION_FEE, TRANSACTION_GAS } from "@/constants/app.constants";
import { UserProfileType } from "@/types/user.type";


type Props = {
  userProfile: UserProfileType;
};
const AchievementsItem = ({ userProfile }: Props) => {
  const [image, setImage] = useState<string>("")
  const [symbol, setSymbol] = useState<string>("")
  const [Owner, setOwner] = useState<Boolean>()
  const [isLoading, setIsLoading] = useState<Boolean>()
  const getInfoOfUser = async () => {

    await getUserInfo()
    if (Owner) {
      await getNftImageAndName()
    }
  }
  useEffect(() => {
    getInfoOfUser()
  }, [Owner])
  const getNftImageAndName = async () => {
    setIsLoading(true)
    const maxFee = Hbar.fromTinybars(MAX_TRANSACTION_FEE * 120)
    try {
      const operatorKey = PrivateKey.fromStringDer("3030020100300706052b8104000a0422042056a76bd58deabbb90a2c46c7217dc9c6705aed6f5e99352898cb22c2419d9202");
      const hederaClient = process.env.NEXT_PUBLIC_HEDERA_NETWORK === 'testnet'
        ? Client.forTestnet().setOperator(AccountId.fromString("0.0.3706195"), operatorKey)
        : Client.forMainnet().setOperator(AccountId.fromString("0.0.3706195"), operatorKey);
      const query = new ContractCallQuery()
        .setContractId("0.0.4256713")
        .setGas(TRANSACTION_GAS)
        .setMaxQueryPayment(maxFee)
        .setFunction("tokenImage");
      const contractCallResult = await query.execute(hederaClient);
      const message = contractCallResult.getString(0);
      const querySymbol = new ContractCallQuery()
        .setContractId("0.0.4256713")
        .setGas(TRANSACTION_GAS)
        .setMaxQueryPayment(maxFee)
        .setFunction("name");
      const contractCallResult1 = await querySymbol.execute(hederaClient);
      const message1 = contractCallResult1.getString(0);
      setImage(message)
      setSymbol(message1)
      console.log(symbol, image)
    } catch (error) {
      console.log(error)
    }
    setIsLoading(false)
  }

  const getUserInfo = async () => {
    setIsLoading(true)
    const maxFee = Hbar.fromTinybars(MAX_TRANSACTION_FEE * 120)
    const operatorKey = PrivateKey.fromStringDer("3030020100300706052b8104000a0422042056a76bd58deabbb90a2c46c7217dc9c6705aed6f5e99352898cb22c2419d9202");
    console.log(operatorKey)
    const AccId = AccountId?.fromString(userProfile?.accountId).toSolidityAddress()
    console.log(AccId)
    const hederaClient = process.env.NEXT_PUBLIC_HEDERA_NETWORK === 'testnet'
      ? Client.forTestnet().setOperator(AccountId.fromString("0.0.3706195"), operatorKey)
      : Client.forMainnet().setOperator(AccountId.fromString("0.0.3706195"), operatorKey);
    const query = new ContractCallQuery()
      .setContractId("0.0.4256713")
      .setGas(TRANSACTION_GAS)
      .setMaxQueryPayment(maxFee)
      .setFunction("balanceOf",
        new ContractFunctionParameters().addAddress(`0x${AccId}`)
      );
    const contractCallResult = await query.execute(hederaClient);
    const message = contractCallResult.getUint256(0);
    console.log(Number(message), "this is message")
    Number(message) > 0 ? setOwner(true) : setOwner(false);
    setIsLoading(false)
  }



  return (
    <div>
      {!isLoading ?
        <div className="relative flex items-center justify-center flex-col gap-4" >
          <img
            alt="image"
            src={image}
            width={"100px"}
            height={"100px"}
          />
          <h2>{symbol}</h2>
        </div>

        : "Loading..."}

    </div>
  );
};

export default AchievementsItem;
