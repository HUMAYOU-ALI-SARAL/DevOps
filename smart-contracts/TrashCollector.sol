// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "./HederaTokenService.sol";
import "./HederaResponseCodes.sol";

contract TrashCollector is HederaTokenService {
  function associateToken(address _token) external returns (int) {
    int response = HederaTokenService.associateToken(address(this), _token);

    if (response != HederaResponseCodes.SUCCESS){
      revert("Failed to associate token");
    }

    return response;
  }
}
