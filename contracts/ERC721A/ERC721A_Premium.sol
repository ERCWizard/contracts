// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts-upgradeable/utils/cryptography/MerkleProofUpgradeable.sol";

import "./ERC721A_Basic.sol";

contract ERC721A_Premium is ERC721A_Basic {
    /// @notice Contract merkle root
    bytes32 public merkleRoot;

    /// @notice Mapping of address to whitelist claimed bool
    mapping(address => bool) public whitelistClaimed;

    /// @notice Contract whitelist mint state
    bool public whitelistMintEnabled;

    /// @notice Function to whitelist mint new tokens
    /// @param _mintAmount Amount of tokens to be minted
    /// @param _merkleProof Merkle proof to verify whitelisted address
    function whitelistMint(uint256 _mintAmount, bytes32[] calldata _merkleProof)
        public
        payable
        mintCompliance(_mintAmount)
        mintPriceCompliance(_mintAmount)
    {
        if (!whitelistMintEnabled) {
            revert Errors.TheWhitelistSaleIsNotEnabled();
        }
        if (whitelistClaimed[_msgSender()]) {
            revert Errors.AddressAlreadyClaimed();
        }
        bytes32 leaf = keccak256(abi.encodePacked(_msgSender()));
        if (!MerkleProofUpgradeable.verify(_merkleProof, merkleRoot, leaf)) {
            revert Errors.InvalidProof();
        }

        whitelistClaimed[_msgSender()] = true;
        _safeMint(_msgSender(), _mintAmount);
    }

    /// @notice Function for changing merkle root
    /// @dev Can only be called by project owner
    /// @param _merkleRoot Merkle root to be set
    function setMerkleRoot(bytes32 _merkleRoot) public onlyOwner {
        merkleRoot = _merkleRoot;
    }

    /// @notice Function for changing whitelist state
    /// @dev Can only be called by project owner
    /// @param _state Whitelist state to be set
    function setWhitelistMintEnabled(bool _state) public onlyOwner {
        whitelistMintEnabled = _state;
    }
}