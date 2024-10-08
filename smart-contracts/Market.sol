// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "./HederaTokenService.sol";
import "./IHederaTokenService.sol";
import "./HederaResponseCodes.sol";

contract Market is HederaTokenService {
  // Error Codes
  enum MarketResponseCodes {
    SUCCESS,
    CONTRACT_DOES_NOT_HAVE_ALLOWANCE,
    NOT_THE_CONTRACT_OWNER,
    BID_NOT_EXISTS,
    NOT_ENOUGH_MONEY,
    TOKEN_ASSOCIATION_FAILED,
    WRONG_PAGINATION,
    WRONG_FUNCTION_INPUTS,
    NFT_ALREADY_LISTED,
    NO_PERMISSION,
    ALLOWANCE_REQUIRED,
    NFT_INFO_FETCH_FAILED,
    NFT_NOT_LISTED,
    NFT_TRANSFER_FAILED,
    HBAR_TRANSFER_FAILED
  }

  /////////////////////////////////
  //////////// EVENTS /////////////
  /////////////////////////////////
  event ListNFT(
    address indexed token,
    uint256 indexed serialNumber,
    address indexed _owner,
    uint256 price
  );
  event UnlistNFT(
    address indexed token,
    uint256 indexed serialNumber,
    address indexed owner,
    uint256 price
  );
  event AddBid(
    address indexed token,
    uint256 serialNumber,
    address indexed owner,
    address indexed buyer,
    uint256 amount
  );
  event DeleteBid(
    address indexed token,
    uint256 indexed serialNumber,
    address indexed owner,
    uint256 amount
  );
  event AcceptBid(
    address indexed token,
    uint256 serialNumber,
    address indexed owner,
    address indexed buyer,
    uint256 acceptedBidAmount
  );

  /////////////////////////////////
  ///////// STRUCTURES ////////////
  /////////////////////////////////
  struct Bid {
    address payable owner;
    uint256 amount;
    address token;
    uint256 serialNumber;
  }

  struct BidIndexes {
    uint256 tokenIndex;
    uint256 receivedIndex;
    uint256 sentIndex;
    bool isSet;
  }

  struct BuyerTokens {
    // total hbars in the contract
    uint256 hbars;
  }

  // Struct to hold NFT details
  struct NFT {
    address payable owner;
    uint256 price;
    address token;
    uint256 serialNumber;
    bool isListed;
  }

  /////////////////////////////////
  ////////// VARIABLES ////////////
  /////////////////////////////////

  // Mapping to store bids for each buyer
  mapping(string => Bid[]) public tokenBids;
  // Store bids maps for fast getting
  mapping(address => Bid[]) public receivedBids;
  mapping(address => Bid[]) public sentBids;

  mapping(address => mapping(string => BidIndexes)) public buyersBidsIndexes;
  mapping(address => BuyerTokens) public buyersTokens;
  // Mapping from NFT to its details
  // Key format: "EVM_TOKEN_ID/SERIAL_NUMBER"
  mapping(string => NFT) public nfts;
  address internal contractOwner;

  modifier onlyContractOwner() {
    require(msg.sender == contractOwner, "Not the contract owner");
    _;
  }

  constructor () {
    contractOwner = msg.sender;
  }

  receive() external payable {}

  fallback() external payable {}

  /////////////////////////////////
  //////////// INTERNAL ///////////
  /////////////////////////////////

  function removeBidInfo(string memory nftId, address _buyer) internal {
    address nftOwner = nfts[nftId].owner;
    require(buyersBidsIndexes[_buyer][nftId].isSet, "There is no bid, you can't remove it");

    BidIndexes memory indexes = buyersBidsIndexes[_buyer][nftId];

    // Iterate through each bid type (token, sent, received)
    for (uint8 bidType = 0; bidType < 3; bidType++) {
      Bid[] storage bidArray;
      uint256 bidIndex;

      // Determine the bid array and index based on bid type
      if (bidType == 0) {
        bidArray = tokenBids[nftId];
        bidIndex = indexes.tokenIndex;
      } else if (bidType == 1) {
        bidArray = sentBids[_buyer];
        bidIndex = indexes.sentIndex;
      } else {
        bidArray = receivedBids[nftOwner];
        bidIndex = indexes.receivedIndex;
      }

      // Move the last element to the position of the element to be removed
      uint256 lastIndex = bidArray.length - 1;
      Bid memory bidToMove = bidArray[lastIndex];
      bidArray[bidIndex] = bidToMove;

      // Remove the last element by reducing the length of the array
      bidArray.pop();

      // Determine the bid array and index based on bid type
      if (bidType == 0) {
        buyersBidsIndexes[bidToMove.owner][nftId].tokenIndex = bidIndex;
      } else if (bidType == 1) {
        buyersBidsIndexes[bidToMove.owner][nftId].sentIndex = bidIndex;
      } else {
        buyersBidsIndexes[bidToMove.owner][nftId].receivedIndex = bidIndex;
      }
    }

    /////////////////////
    /////// FINAL ///////
    /////////////////////

    // Remove pointer for removed bid
    buyersBidsIndexes[_buyer][nftId].isSet = false;
  }

  function sendHbars(
    address sender,
    address recipient,
    uint256 amount
  ) internal {
    require(buyersTokens[sender].hbars >= amount, "Not enough user hbars on the contract!");

    (bool sent, ) = recipient.call{value: amount}("");
    require(sent, "Failed to send Hbar");

    if (sender != address(this)) {
      buyersTokens[sender].hbars -= amount;
    }
  }

  // acceptedBuyer address(0) = return money to everybody
  function removeBids(
    string memory nftId,
    address moneyBackException
  ) internal {
    int256 index = int256(tokenBids[nftId].length) - 1;

    while (index >= 0) {
      uint256 _index = uint256(index);
      Bid memory bid = tokenBids[nftId][_index];

      // return money from bid
      if (bid.owner != moneyBackException) {
        sendHbars(bid.owner, bid.owner, bid.amount);
      }

      removeBidInfo(nftId, bid.owner);

      index = int256(tokenBids[nftId].length) - 1;
    }
  }

  function addressToString(address _addr) internal pure returns (string memory) {
    bytes32 value = bytes32(uint256(uint160(_addr)));
    bytes memory alphabet = "0123456789abcdef";

    bytes memory str = new bytes(42);
    str[0] = '0';
    str[1] = 'x';

    for (uint256 i = 0; i < 20; i++) {
      str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
      str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
    }
    return string(str);
  }

  function uint256ToString(uint256 _num) internal pure returns (string memory) {
    if (_num == 0) {
      return "0";
    }

    uint256 num = _num;
    uint256 digits = 0;
    uint256 tempNum = num;

    while (tempNum != 0) {
      digits++;
      tempNum /= 10;
    }

    bytes memory buffer = new bytes(digits);

    uint256 index = digits;

    while (num != 0) {
      index--;
      buffer[index] = bytes1(uint8(48 + (num % 10)));
      num /= 10;
    }

    return string(buffer);
  }

  function concatenateAddressAndInt(address _addr, uint256 _num) internal pure returns (string memory) {
    string memory addressString = addressToString(_addr);
    string memory intString = uint256ToString(_num);

    return string(abi.encodePacked(addressString, "/", intString));
  }

  function formatNftId(address _token, uint256 _serialNumber) internal pure returns (string memory) {
    return concatenateAddressAndInt(
      _token,
      _serialNumber
    );
  }

  function getPaginatedBids(Bid[] memory bidArray, uint64 page, uint64 pageSize) private pure returns (Bid[] memory) {
    if (bidArray.length == 0) {
      return bidArray;
    }

    require(pageSize > 0, "pageSize must be greater than 0");
    require(page > 0, "pagination is starting at 1");

    uint256 startIndex = (page - 1) * pageSize;
    require(startIndex < bidArray.length, "Page out of bounds");

    uint256 endIndex = startIndex + pageSize;
    if (endIndex > bidArray.length) {
      endIndex = bidArray.length;
    }

    Bid[] memory pageBids = new Bid[](endIndex - startIndex);

    for (uint256 i = startIndex; i < endIndex; i++) {
      pageBids[i - startIndex] = bidArray[i];
    }

    return pageBids;
  }

  /////////////////////////////////
  //////////// PUBLIC /////////////
  /////////////////////////////////

  function associateToken(address _token) onlyContractOwner external returns (int) {
    int response = HederaTokenService.associateToken(address(this), _token);

    if (response != HederaResponseCodes.SUCCESS){
      revert("Failed to associate token");
    }

    return response;
  }

  function sendHbarsToContract() external payable returns (uint) {
    return uint(MarketResponseCodes.SUCCESS);
  }

  function getTokenBid(
    address _token,
    uint256 _serialNumber,
    address _buyer
  ) public view returns (Bid memory) {
    string memory nftId = formatNftId(_token, _serialNumber);

    Bid memory bid = Bid({
      amount: 0,
      owner: payable(_buyer),
      token: _token,
      serialNumber: _serialNumber
    });

    BidIndexes memory bidIndex = buyersBidsIndexes[_buyer][nftId];

    if (!bidIndex.isSet) {
      return bid;
    }

    return tokenBids[nftId][bidIndex.tokenIndex];
  }

  function getTokenBids(
    address _token,
    uint256 _serialNumber,
    uint64 page,
    uint64 pageSize
  ) public view returns (Bid[] memory) {
    string memory nftId = formatNftId(_token, _serialNumber);
    Bid[] memory allBids = tokenBids[nftId];

    return getPaginatedBids(allBids, page, pageSize);
  }

  function getReceivedBids(
    address _owner,
    uint64 page,
    uint64 pageSize
  ) public view returns (Bid[] memory) {
    Bid[] memory allBids = receivedBids[_owner];

    return getPaginatedBids(allBids, page, pageSize);
  }

  function getSentBids(
    address _buyer,
    uint64 page,
    uint64 pageSize
  ) public view returns (Bid[] memory) {
    Bid[] memory allBids = sentBids[_buyer];

    return getPaginatedBids(allBids, page, pageSize);
  }

  /////////////////////////////////
  ////////// NFT OWNER ////////////
  /////////////////////////////////

  function listNFT(
    address[] memory _tokens,
    uint256[] memory _serialNumbers,
    uint256[] memory _prices
  ) external returns (uint) {
    require(_tokens.length > 0 && _serialNumbers.length > 0 && _prices.length > 0, "Array length should be more than 0");
    require(_tokens.length == _serialNumbers.length && _tokens.length == _prices.length, "Arrays length mismatch");

    for (uint256 i = 0; i < _tokens.length; i++) {
      address _token = _tokens[i];
      uint256 _serialNumber = _serialNumbers[i];
      uint256 _price = _prices[i];

      (
        int responseCode,
        IHederaTokenService.NonFungibleTokenInfo memory tokenInfo
      ) = HederaTokenService.getNonFungibleTokenInfo(_token, int64(int256(_serialNumber)));

      require(responseCode == HederaResponseCodes.SUCCESS, "Failed to fetch NFT Info");
      require(tokenInfo.spenderId == address(this), "The Contract doesn't have allowance for this token");
      require(msg.sender == tokenInfo.ownerId, "You have no permission for this function");

      string memory nftId = formatNftId(_token, _serialNumber);

      if (
        nfts[nftId].isListed
        && nfts[nftId].owner != tokenInfo.ownerId
      ) {
        removeBids(nftId, address(0));
      }

      nfts[nftId] = NFT({
        owner: payable(tokenInfo.ownerId),
        price: _price,
        token: _token,
        serialNumber: _serialNumber,
        isListed: true
      });

      emit ListNFT(_token, _serialNumber, msg.sender, _price);

      Bid memory maxAmountBid;
      for (uint256 j = 0; j < tokenBids[nftId].length; j++) {
        Bid memory bid = tokenBids[nftId][j];

        if (
          bid.amount >= nfts[nftId].price
          && bid.amount > maxAmountBid.amount
        ) {
          maxAmountBid = bid;
          break;
        }
      }

      if (maxAmountBid.amount != 0) {
        this.acceptBid(_token, _serialNumber, maxAmountBid.owner, maxAmountBid.amount);
      }
    }

    return uint(MarketResponseCodes.SUCCESS);
  }

  function unlistNFT(
    address _token,
    uint256 _serialNumber
  ) external returns (uint) {
    string memory nftId = formatNftId(_token, _serialNumber);

    (
      int responseCode,
      IHederaTokenService.NonFungibleTokenInfo memory tokenInfo
    ) = HederaTokenService.getNonFungibleTokenInfo(_token, int64(int256(_serialNumber)));

    require(responseCode == HederaResponseCodes.SUCCESS, "Failed to fetch NFT Info");

    require(
      msg.sender == tokenInfo.ownerId
      || msg.sender == contractOwner,
      "You have no permission for this function"
    );

    removeBids(nftId, address(0));

    nfts[nftId].isListed = false;

    emit UnlistNFT(_token, _serialNumber, tokenInfo.ownerId, nfts[nftId].price);
    return uint(MarketResponseCodes.SUCCESS);
  }

  function acceptBid(
    address _token,
    uint256 _serialNumber,
    address payable _buyer,
    uint256 _acceptedBidAmount
  ) external returns (uint) {
    string memory nftId = formatNftId(_token, _serialNumber);

    require(
      msg.sender == nfts[nftId].owner || msg.sender == address(this),
      "You have no permission for this function"
    );
    require(nfts[nftId].isListed, "NFT not listed");

    (
      int responseCode,
      IHederaTokenService.NonFungibleTokenInfo memory nftInfo
    ) = HederaTokenService.getNonFungibleTokenInfo(_token, int64(int256(_serialNumber)));

    require(responseCode == HederaResponseCodes.SUCCESS, "Failed to fetch NFT Info");
    require(nftInfo.spenderId == address(this), "Contract doesn't have allowance for this NFT");
    require(buyersBidsIndexes[_buyer][nftId].isSet, "Buyer doesn't have bid for this NFT");
    require(
      tokenBids[nftId][buyersBidsIndexes[_buyer][nftId].tokenIndex].amount == _acceptedBidAmount,
      "This buyer didn't suggest that price value for this NFT"
    );
    require(buyersTokens[_buyer].hbars >= _acceptedBidAmount, "Buyer doesn't have enough HBARs in the contract");

    // not sure about royalty
    uint256 ownerRewardAmount = _acceptedBidAmount;
    IHederaTokenService.RoyaltyFee memory royalty = nftInfo.tokenInfo.royaltyFees[0];

    if (royalty.numerator > 0) {
      uint256 royaltyAmount = ownerRewardAmount * uint256(int256(royalty.numerator / royalty.denominator));

      (bool royaltySent, ) =  payable(royalty.feeCollector).call{value: royaltyAmount}("");
      require(royaltySent, "Failed to send royalty Hbar");

      ownerRewardAmount -= royaltyAmount;
    }

    sendHbars(_buyer, nfts[nftId].owner, ownerRewardAmount);

    // transfer NFT
    int nftTransferResponse = this.transferFromNFT(_token, nfts[nftId].owner, _buyer, _serialNumber);
    require(nftTransferResponse == HederaResponseCodes.SUCCESS, "Failed to transfer NFT");

    // return money for other bids
    removeBids(nftId, _buyer);

    emit AcceptBid(_token, _serialNumber, nfts[nftId].owner, _buyer, _acceptedBidAmount);

    // Unlist nft.
    nfts[nftId].isListed = false;
    nfts[nftId].owner = _buyer;

    return uint(MarketResponseCodes.SUCCESS);
  }

  /////////////////////////////////
  ///////////// BUYER /////////////
  /////////////////////////////////

  function addBid(
    address _token,
    uint256 _serialNumber
  ) external payable returns (uint) {
    address payable _buyer = payable(msg.sender);
    string memory nftId = formatNftId(_token, _serialNumber);

    require(nfts[nftId].isListed, "NFT not listed");

    (
      int responseCode,
      IHederaTokenService.NonFungibleTokenInfo memory nftInfo
    ) = HederaTokenService.getNonFungibleTokenInfo(_token, int64(int256(_serialNumber)));

    require(responseCode == HederaResponseCodes.SUCCESS, "Failed to fetch NFT Info");
    require(nftInfo.ownerId == nfts[nftId].owner, "Nft owner has been changed. Invalid NFT listing.");

    // add buyer info to contract to track buyer money in the contract
    if (buyersTokens[_buyer].hbars == 0) {
      buyersTokens[_buyer] = BuyerTokens({
        hbars: msg.value
      });
    } else {
      buyersTokens[_buyer].hbars += msg.value;
    }

    BidIndexes memory prevBidIndex = buyersBidsIndexes[_buyer][nftId];

    if (buyersBidsIndexes[_buyer][nftId].isSet) {
      Bid memory _previousBid = tokenBids[nftId][prevBidIndex.tokenIndex];

      sendHbars(_buyer, _buyer, _previousBid.amount);

      tokenBids[nftId][prevBidIndex.tokenIndex].amount = msg.value;
      receivedBids[nfts[nftId].owner][prevBidIndex.receivedIndex].amount = msg.value;
      sentBids[_buyer][prevBidIndex.sentIndex].amount = msg.value;

      if (msg.value >= nfts[nftId].price) {
        return this.acceptBid(_token, _serialNumber, _buyer, msg.value);
      }

      emit AddBid(_token, _serialNumber, nftInfo.ownerId, msg.sender, msg.value);
      return uint(MarketResponseCodes.SUCCESS);
    }

    // add bid and save its index
    Bid memory bid = Bid({
      amount: msg.value,
      owner: _buyer,
      token: _token,
      serialNumber: _serialNumber
    });

    tokenBids[nftId].push(bid);
    sentBids[msg.sender].push(bid);
    receivedBids[nfts[nftId].owner].push(bid);

    buyersBidsIndexes[_buyer][nftId] = BidIndexes({
      tokenIndex: tokenBids[nftId].length - 1,
      sentIndex: sentBids[msg.sender].length - 1,
      receivedIndex: receivedBids[nfts[nftId].owner].length - 1,
      isSet: true
    });

    if (msg.value >= nfts[nftId].price) {
      return this.acceptBid(_token, _serialNumber, _buyer, bid.amount);
    }

    emit AddBid(_token, _serialNumber, nftInfo.ownerId, msg.sender, msg.value);
    return uint(MarketResponseCodes.SUCCESS);
  }

  function deleteBid(
    address _token,
    uint256 _serialNumber,
    address payable _buyer
  ) external returns (uint) {
    string memory nftId = formatNftId(_token, _serialNumber);

    require(
      msg.sender == _buyer
      || msg.sender == contractOwner,
      "You have no permissions for this function."
    );
    require(buyersBidsIndexes[_buyer][nftId].isSet, "You have no bids for this NFT");

    uint256 bidTokenIndex = buyersBidsIndexes[_buyer][nftId].tokenIndex;
    Bid memory bid = tokenBids[nftId][bidTokenIndex];

    require(
      buyersTokens[_buyer].hbars >= tokenBids[nftId][bidTokenIndex].amount,
      "You have no enough money in the contract to delete bid"
    );

    emit DeleteBid(_token, _serialNumber, msg.sender, bid.amount);

    sendHbars(_buyer, _buyer, bid.amount);
    removeBidInfo(nftId, bid.owner);

    return uint(MarketResponseCodes.SUCCESS);
  }
}
