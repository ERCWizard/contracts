// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

library Errors {
    /// Insufficient funds!
    error InsufficientFunds();

    /// Invalid Storage Implementation!
    error InvalidStorageImplementation();

    /// Invalid ERC721A Implementation!
    error InvalidERC721AImplementation();

    /// Invalid ERC1155 Implementation!
    error InvalidERC1155Implementation();

    /// Invalid mint amount!
    error InvalidMintAmount();

    /// Max supply exceeded!
    error MaxSupplyExceeded();

    /// The whitelist sale is not enabled!
    error TheWhitelistSaleIsNotEnabled();

    /// Address already claimed!
    error AddressAlreadyClaimed();

    /// Invalid proof!
    error InvalidProof();

    /// The contract is paused!
    error TheContractIsPaused();

    /// URI query for nonexistent token!
    error ERC721__URIQueryForNonexistentToken();

    /// Caller is not the factory!
    error CallerIsNotTheFactory();
}
