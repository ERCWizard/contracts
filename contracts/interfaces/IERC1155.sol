//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

/// @title ERC1155
/// @notice Defines the interface of ERC1155
interface IERC1155 {
  function initialize(
    string memory _name,
    string memory _symbol,
    uint256 _id,
    uint256 _amount,
    string memory _uri,
    address _royaltyReceiver,
    uint96 _feePercent,
    address _owner
  ) external;
}