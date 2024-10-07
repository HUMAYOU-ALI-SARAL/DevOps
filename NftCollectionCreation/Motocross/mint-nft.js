const { AccountId, Client, Hbar, PrivateKey, TokenMintTransaction } = require('@hashgraph/sdk');
const dotenv = require('dotenv');
const metadataLinks = require('../CollectionLinks.json');
const path = require('path');

dotenv.config({path: path.resolve(__dirname, '../.env')});

// Configure accounts and client
const treasuryId = AccountId.fromString(process.env.TREASURY_ACCOUNT_ID);
const treasuryKey = PrivateKey.fromStringDer(process.env.TREASURY_ACCOUNT_DER_PRIVATE_KEY);
const tokenId = process.env.MotoCross_TokenId;
const client = process.env.HEDERA_NETWORK === 'testnet' ?
  Client.forTestnet().setOperator(treasuryId, treasuryKey) :
  Client.forMainnet().setOperator(treasuryId, treasuryKey);

async function main() {
  let CID = metadataLinks["MotoCross"].map(link => Buffer.from(link));
  while (CID.length) {
    const chunkCID = CID.slice(0, 10);
    CID = CID.slice(10);
    // MINT NEW BATCH OF NFTs
    const mintTx = new TokenMintTransaction()
      .setTokenId(tokenId)
      .setMetadata(chunkCID) // Batch minting - UP TO 10 NFTs in single tx
      .setMaxTransactionFee(new Hbar(20))
      .freezeWith(client);

    // Sign the transaction with the supply key
    const mintTxSigned = await mintTx.sign(treasuryKey);

    // Submit the transaction to a Hedera network
    const mintTxSubmit = await mintTxSigned.execute(client);

    // Get the transaction receipt
    const mintRx = await mintTxSubmit.getReceipt(client);

    const serials = mintRx.serials.map((serial) => serial.low).join(', ');

    // Log the serial number
    console.log(`- Created NFT ${tokenId} with serials: ${serials} \n`);
  }

  process.exit(0);
}

main();
