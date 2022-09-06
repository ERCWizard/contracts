//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

/// @title ERC1155
/// @author a6Ce6Bs
/// @notice Defines the interface of ERC1155
interface IERC1155 {
  function initialize(
    string memory _collectionName,
    string memory _collectionSymbol,
    uint256 _id,
    uint256 _amount,
    string memory _uri,
    address _royaltyReceiver,
    uint96 _feePercent,
    address _contractOwner
  ) external;
}