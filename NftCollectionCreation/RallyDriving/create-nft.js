const {
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  AccountId,
  PrivateKey,
  Client,
  CustomRoyaltyFee,
  Hbar

} = require('@hashgraph/sdk');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({path: path.resolve(__dirname, '../.env')});

// Configure accounts and client
const treasuryId = AccountId.fromString(process.env.TREASURY_ACCOUNT_ID);
const treasuryKey = PrivateKey.fromStringDer(process.env.TREASURY_ACCOUNT_DER_PRIVATE_KEY);
const client = process.env.HEDERA_NETWORK === 'testnet' ?
  Client.forTestnet().setOperator(treasuryId, treasuryKey) :
  Client.forMainnet().setOperator(treasuryId, treasuryKey)

async function main() {
  // Create the NFT
  // CHANGE OPTIONS HERE
  const nftCreate = new TokenCreateTransaction()
    .setTokenName(process.env.TOKEN_NAME9)
    .setTokenSymbol(process.env.TOKEN_SYMBOL9)
    .setTokenType(TokenType.NonFungibleUnique)
    .setDecimals(0)
    .setInitialSupply(0)
    .setTokenMemo(process.env.TOKEN_METADATA_IPFS_URL9)
    .setTreasuryAccountId(treasuryId)
    .setSupplyType(TokenSupplyType.Finite)
    .setSupplyKey(treasuryKey)
    .setAdminKey(treasuryKey)
    .setCustomFees([new CustomRoyaltyFee({
      feeCollectorAccountId: treasuryId,
      numerator: process.env.TOKEN_ROYALTY_FEE_NUMERATOR9,
      denominator: process.env.TOKEN_ROYALTY_FEE_DENOMINATOR9,
      allCollectorsAreExempt: false,
    })])
    .setMaxSupply(process.env.TOKEN_MAX_SUPPLY9)
    .setAutoRenewAccountId(treasuryId)
    .setAutoRenewPeriod(7776000)
    .setMaxTransactionFee(new Hbar(40))
    .freezeWith(client);

  // Sign the transaction with the treasury key
  const nftCreateTxSigned = await nftCreate.sign(treasuryKey);

  // Submit the transaction to a Hedera network
  const nftCreateSubmit = await nftCreateTxSigned.execute(client);

  // Get the transaction receipt
  const nftCreateRx = await nftCreateSubmit.getReceipt(client);

  // Get the token ID
  const tokenId = nftCreateRx.tokenId;

  // Log the token ID
  console.log(`- Created NFT with Token ID: ${tokenId} \n`);

  fs.writeFileSync(path.resolve(__dirname, `../created-tokens/${Date.now()}-${tokenId}`), `Token ID: ${tokenId}\nTreasury Account: ${treasuryId.toString()}`);

  process.exit(0);
}

main();
