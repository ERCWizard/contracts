// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

library Enums {
  /// @notice Contract standard
    enum Standard { 
      ERC721A,
      ERC1155
    }

    /// @notice Contract standard tier
    enum Tier { 
      Basic,
      Premium,
      Advanced
    }
}