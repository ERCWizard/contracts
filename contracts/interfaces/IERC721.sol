//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

/// @title ERC721
/// @author a6Ce6Bs
/// @notice Defines the interface of ERC721
interface IERC721 {
  function initialize(
    string memory _collectionName,
    string memory _collectionSymbol,
    uint256 _collectionCost,
    uint256 _collectionMaxSupply,
    uint256 _maxMintAmountPerTx,
    string memory _hiddenMetadataUri,
    string memory _uriPrefix,
    address _royaltyReceiver,
    uint96 _feePercent,
    address _contractOwner
  ) external;
}