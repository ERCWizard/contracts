// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

library Events {
  /// @notice Emmited on setRoyaltyInfo()
  /// @param royaltyReceiver Royalty fee collector
  /// @param feePercent Royalty fee numerator; denominator is 10,000. So 500 represents 5%
  event RoyaltyInfoChanged(
    address indexed royaltyReceiver,
    uint96 feePercent
  );

  /// @notice Emmited on setTokenRoyaltyInfo()
  /// @param tokenId Token ID royalty to be set
  /// @param royaltyReceiver Royalty fee collector
  /// @param feePercent Royalty fee numerator; denominator is 10,000. So 500 represents 5%
  event TokenRoyaltyInfoChanged(
    uint256 tokenId,
    address indexed royaltyReceiver,
    uint96 feePercent
  );
}