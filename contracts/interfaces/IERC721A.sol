//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

/// @title ERC721A
/// @notice Defines the interface of ERC721A
interface IERC721A {
  function initialize(
    string memory _name,
    string memory _symbol,
    uint256 _cost,
    uint256 _maxSupply,
    uint256 _maxMintAmountPerTx,
    string memory _hiddenMetadataUri,
    string memory _uriPrefix,
    address _royaltyReceiver,
    uint96 _feePercent,
    address _owner
  ) external;
}