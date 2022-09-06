// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

/// Insufficient funds!
error WizardFactory__InsufficientFunds();

/// Invalid ERC721 Implementation!
error WizardFactory__InvalidERC721Implementation();

/// Invalid ERC1155 Implementation!
error WizardFactory__InvalidERC1155Implementation();

/// Insufficient funds!
error ERC721__InsufficientFunds();

/// Invalid mint amount!
error ERC721__InvalidMintAmount();

/// Max supply exceeded!
error ERC721__MaxSupplyExceeded();

/// The whitelist sale is not enabled!
error ERC721__TheWhitelistSaleIsNotEnabled();

/// Address already claimed!
error ERC721__AddressAlreadyClaimed();

/// Invalid proof!
error ERC721__InvalidProof();

/// The contract is paused!
error ERC721__TheContractIsPaused();

/// URI query for nonexistent token!
error ERC721__URIQueryForNonexistentToken();