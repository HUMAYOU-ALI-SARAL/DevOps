# SpheraWorld

## Hedera integration

### NFT collection metadata
# Sign up : 150
# SBT Achievements : 1500
# Daily Sign in (once a day ) : 10
# Invite Referral Code : 100
# Buying NET : 200
# Listing NFT : 10
# Bidding NFT :100

Images and descriptions of collections in Hedera are are provided by a collection's metadata. For
more information on recommended metadata format, see <https://hips.hedera.com/hip/hip-412>

The following demonstrates the structure of a collection:

```json
{
  "name": "<COLLECTION_NAME>",
  "image": "<COLLECTION_IMAGE_IPFS_URL>",
  "description": "<COLLECTION_DESCRIPTION>",
  "creator": "<COLLECTION_CREATOR>"
}
```

For example:

```json
{
  "name": "Sphera Fan",
  "image": "ipfs://QmUkjowAFZEHUP8kLx85s4cCTsy4xxrPnSLkLyMmugqb2U",
  "description": "Dive into the exhilarating universe of Sphera World - This NFT is a passport to a realm of digital fandom! Unlock exclusive early access to the Sphera token. Enter the Sphera launch raffle and claim free Sphera World Jersey NFTs on release. Get ready for an adventure in sports and digital collectibles!",
  "creator": "Sphera World"
}
```

### Creating an NFT collection on Hedera

1. First upload the collection image to IPFS.
2. Then, create a collection metadata file and upload it to IPFS.
3. Finally, add the link of the metadata file to the memo of the collection’s token.
   - This can be done during
     [token creation](https://docs.hedera.com/hedera/sdks-and-apis/sdks/readme-1/define-a-token), or
     after by updating the token. See
     [update a token](https://docs.hedera.com/hedera/sdks-and-apis/sdks/readme-1/update-a-token).
     For an example of a token with valid metadata in the memo see
     [0.0.2666146](https://hashscan.io/testnet/token/0.0.2666146).

### Using this repos helpers to create a collection

1. Copy the required environment variables: `cp ./nft-creation/.env.example ./nft-creation/.env`
2. Open `./nft-creation/.env` file and pass the required data:

   - `TREASURY_ACCOUNT_ID`: This is the account that will receive royalties from NFT transfers.
   - `TREASURY_ACCOUNT_DER_PRIVATE_KEY` - The private key that controls the account
   - `TOKEN_METADATA_IPFS_URL` - The collection metadata IPFS URL. (for our example:
     [`ipfs://QmXF6xiSWq8GmovK1qpPZ14C5tMEMmkrjLGuVgVP1J3vnb`](https://ipfs.io/ipfs/QmXF6xiSWq8GmovK1qpPZ14C5tMEMmkrjLGuVgVP1J3vnb))

3. Create an NFT collection with the command: `npm run nft:create`

If everything is correct, the command will return a newly created token id. Created tokens and the
associated treasury account ids will be saved in the folder `./nft-creation/created-tokens`.

In our example, we have created the following NFT Collection:
[`0.0.3700970`](https://hashscan.io/testnet/token/0.0.3700970).

### Minting NFTs into a collection on Hedera

1. First, upload the NFT images to IPFS.

   - The recommended approach is to put each NFT image into a folder and upload that folder to IPFS.
     With this approach, each image will have the same extension and will have the filename be that
     of the serial number. For an example, see the `./nft-creation/example/example-nfts-images`
     project folder. The uploaded folder will have a CID
     ([Content Identifier](https://docs.ipfs.tech/concepts/content-addressing/)) that is an an
     identifier of the folder, not the file. So, if we want to get the IPFS URL for image '4.png',
     the IPFS URL will be
     [`ipfs://QmfGuBAHfBzDGtHd5NwWF1wUwzzp7WUCVj6AP2VoDrHeK8/4.png`](https://ipfs.io/ipfs/QmfGuBAHfBzDGtHd5NwWF1wUwzzp7WUCVj6AP2VoDrHeK8/4.png).

2. Next, create the NFT metadata. Each NFT will have its own metadata.

   - Similar to NFT images, it is recommended to put each NFT metadata file in folder and name each
     file `<serial-number>.json`. An example is available in the
     `nft-creation/example/example-nfts-metadata` project folder.

```json
{
  "name": "<NFT_NAME>",
  "creator": "<NFT_CREATOR>",
  "image": "<NFT_IMAGE_IPFS_URL>",
  "type": "image/png",
  "description": "<NFT_DESCRIPTION>",
  "attributes": [
    {
      "trait_type": "<NFT_ATTRIBUTE_NAME>",
      "value": "<NFT_ATTRIBUTE_VALUE>"
    },
    {
      "trait_type": "<NFT_ATTRIBUTE_NAME>",
      "value": "<NFT_ATTRIBUTE_VALUE>"
    }
  ]
}
```

For our example:

```json
{
  "name": "Fan INO Card #4",
  "creator": "Sphera World",
  "description": "Dive into the exhilarating universe of Sphera World - This NFT is a passport to a realm of digital fandom! Unlock exclusive early access to the Sphera token. Enter the Sphera launch raffle and claim free Sphera World Jersey NFTs on release. Get ready for an adventure in sports and digital collectibles!",
  "image": "ipfs://QmfGuBAHfBzDGtHd5NwWF1wUwzzp7WUCVj6AP2VoDrHeK8/4.png",
  "type": "image/png",
  "attributes": [
    {
      "trait_type": "Tier",
      "value": "Fan"
    },
    {
      "trait_type": "Tokens",
      "value": "1500"
    },
    {
      "trait_type": "Jersey NFT",
      "value": "1"
    }
  ]
}
```

3. Upload the metadata folder to IPFS. For our example, we are using:
   [`ipfs://QmbA31aNEbAaBwvnpNxBXzbPpKcioFnu8rqUufLauwpBGc`](https://ipfs.io/ipfs/QmbA31aNEbAaBwvnpNxBXzbPpKcioFnu8rqUufLauwpBGc/)

##### Minting:

1. Open the file `/nft-creation/nftMetadataLinks.json` and pass the NFTs metadata IPFS URLs. For our
   example, it will look like this:

```json
{
  "links": [
    "ipfs://QmbA31aNEbAaBwvnpNxBXzbPpKcioFnu8rqUufLauwpBGc/1.json",
    "ipfs://QmbA31aNEbAaBwvnpNxBXzbPpKcioFnu8rqUufLauwpBGc/2.json",
    "ipfs://QmbA31aNEbAaBwvnpNxBXzbPpKcioFnu8rqUufLauwpBGc/3.json",
    "ipfs://QmbA31aNEbAaBwvnpNxBXzbPpKcioFnu8rqUufLauwpBGc/4.json",
    "ipfs://QmbA31aNEbAaBwvnpNxBXzbPpKcioFnu8rqUufLauwpBGc/5.json",
    "ipfs://QmbA31aNEbAaBwvnpNxBXzbPpKcioFnu8rqUufLauwpBGc/6.json",
    "ipfs://QmbA31aNEbAaBwvnpNxBXzbPpKcioFnu8rqUufLauwpBGc/7.json",
    "ipfs://QmbA31aNEbAaBwvnpNxBXzbPpKcioFnu8rqUufLauwpBGc/8.json",
    "ipfs://QmbA31aNEbAaBwvnpNxBXzbPpKcioFnu8rqUufLauwpBGc/9.json",
    "ipfs://QmbA31aNEbAaBwvnpNxBXzbPpKcioFnu8rqUufLauwpBGc/10.json"
  ]
}
```

2. Open the `./nft-creation/.env` file and change `TOKEN_ID` to the token ID of the collection in
   which to mint the new NFTs.

3. Mint NFTs by running the command: `npm run nft:mint`.
   - To see the the NFTs on the network, find the token in [hashscan](https://hashscan.io/) and view
     the NFTs at the bottom of the page. The example token at the time of writing (testnet
     periodically resets) is: [`0.0.3700970`](https://hashscan.io/testnet/token/0.0.3700970).

The newly minted NFTs will be in the treasury account.

### Smart contracts

Smart contracts have a `contract owner`. The `contract owner` is set to the
`deployer account address` during deployment to Hedera. (`deployer account address` is the address
of the account from which the smart contract was deployed).

So `deployer account address` and `contract owner` are the SAME.

The `contract owner` can delete bids and unlist NFTs. This is needed to unlist NFTs and delete bid
timers.

To redeploy smart contracts with a new **contact owner**, follow these instructions:
https://docs.hedera.com/hedera/tutorials/smart-contracts/deploy-a-smart-contract-using-remix

After deployment of the smart contracts, add the appropriate values to the `.env` file:

```
# Deployer Account credentials
CONTRACT_OWNER_ACCOUNT_ID="0.0.2665303"
CONTRACT_OWNER_ACCOUNT_PRIV_KEY="3030020100300706052b8104000a042204202b741e5b284b468a2c465ccd1bf74be9b58e085b7180c37548587e7bcab42e1d"

# Market smart-contract id. Example: 0.0.3418318
NEXT_PUBLIC_MARKET_CONTRACT_ID=<CONTRACT_ID_HERE>

# TrashCollector smart-contract id (for token burn). Example: 0.0.7697722
NEXT_PUBLIC_TRASH_COLLECTOR_CONTRACT_ID=<CONTRACT_ID_HERE>
```

### Adding NFT collections to the application

To add new NFT collections that will be visible in the application, add to the `.env` file
**comma-separated** values with the pattern: `<token_id>/<creator_name>`.

- `<token_id>` is the token id of NFT collection.

- `<creator_name>` is the collection creator name. To show the collection in the tab **Sphera**,
  this should be `sphera_world`. Otherwise, it can be any string. For example:

```ts
VALIDATED_NFT_COLLECTIONS =
  '0.0.2666146/sphera_world, 0.0.2666322/sphera_world, 0.0.2666364/random_creator_name';
```

## Web2 application

## Developing

This repo is set up as a monorepo housing frontend, backend, and smart contract code in their
respective folders.

1. Install dependencies:

```sh
npm i
```

2. Copy development environment file:

```sh
cp .env.example .env
```

3. Run postgresql and redis via docker

```sh
docker compose up db redis --detach
```

4. Run the application. Both the frontend and backend will start dev servers. The frontend will
   serve on http://localhost:8080.

```sh
npm run dev
```

Notes:

- for linux users - you many need to increase the limit to opened files:
  `echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`

- This monorepo uses turbo repo to simplify managing the monorepo in addtion to build caching. To
  add a new package to a specific workspace (i.e. the frontend). run
  `npm i <package-name> --workspace=<workspace>`. For more information visit
  https://turbo.build/repo/docs/handbook/package-installation#addingremovingupgrading-packages

### Internationalization

To change the text that is displayed to users, update the appropriate file in
`frontend/public/locales`.

## Building for production locally

1. Install dependencies:

```sh
npm i
```

2. Copy development environment file:

```sh
cp .env.docker .env
```

3. Run the application

```sh
docker compose up --build
```

- Depending on other processes running on different ports on the machine, you may need to change the
  default ports used by this application.
- To run in detached mode (a daemon) add the `--detached` or `-d` argument
