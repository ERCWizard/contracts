// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/common/ERC2981Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";

import {Events} from "./libraries/Events.sol";

contract ERC1155 is ERC1155Upgradeable, ERC2981Upgradeable, OwnableUpgradeable {
    /// @notice Contract name
    string public name;

    /// @notice Contract symbol
    string public symbol;

    /// @notice Mapping of uint (tokenId) to tokenURI
    mapping(uint => string) public tokenURI;

    /// @notice Emmited on initialize()
    /// @param _name Contract name
    /// @param _symbol Contract symbol
    /// @param _id Token id
    /// @param _amount Token supply
    /// @param _uri Token uri
    /// @param _royaltyReceiver Royalty fee collector
    /// @param _feePercent Royalty fee numerator; denominator is 10,000. So 500 represents 5%
    /// @param _owner Contract owner
    event InitializedContract(
        string indexed _name,
        string indexed _symbol,
        uint256 _id,
        uint256 _amount,
        string _uri,
        address _royaltyReceiver,
        uint96 _feePercent,
        address indexed _owner
    );

    /// @notice Contract initialization
    /// @param _name Contract name
    /// @param _symbol Contract symbol
    /// @param _id Token id
    /// @param _amount Token supply
    /// @param _uri Token uri
    /// @param _royaltyReceiver Royalty fee collector
    /// @param _feePercent Royalty fee numerator; denominator is 10,000. So 500 represents 5%
    /// @param _owner Contract owner
    function initialize(
        string memory _name,
        string memory _symbol,
        uint256 _id,
        uint256 _amount,
        string memory _uri,
        address _royaltyReceiver,
        uint96 _feePercent,
        address _owner
    ) external initializer {
        __Ownable_init();
        __ERC1155_init("");
        name = _name;
        symbol = _symbol;
        _mint(_owner, _id, _amount, "");
        setURI(_id, _uri);
        setRoyaltyInfo(_royaltyReceiver, _feePercent);
        transferOwnership(_owner);

        emit InitializedContract(
            _name,
            _symbol,
            _id,
            _amount,
            _uri,
            _royaltyReceiver,
            _feePercent,
            _owner
        );
    }

    /// @notice Function for changing royalty information
    /// @dev Can only be called by project owner
    /// @dev Owner can prevent any sale by setting the address to any address that can't receive native network token
    /// @param _royaltyReceiver Royalty fee collector
    /// @param _feePercent Royalty fee numerator; denominator is 10,000. So 500 represents 5%
    function setRoyaltyInfo(address _royaltyReceiver, uint96 _feePercent)
        public
        onlyOwner
    {
        _setDefaultRoyalty(_royaltyReceiver, _feePercent);
        emit Events.RoyaltyInfoChanged(_royaltyReceiver, _feePercent);
    }

    /// @notice Function for changing token royalty information
    /// @dev Can only be called by project owner
    /// @dev Owner can prevent any sale by setting the address to any address that can't receive native network token
    /// @param _tokenId Token ID royalty to be set
    /// @param _royaltyReceiver Royalty fee collector
    /// @param _feePercent Royalty fee numerator; denominator is 10,000. So 500 represents 5%
    function setTokenRoyaltyInfo(
        uint256 _tokenId,
        address _royaltyReceiver,
        uint96 _feePercent
    ) public onlyOwner {
        _setTokenRoyalty(_tokenId, _royaltyReceiver, _feePercent);
        emit Events.TokenRoyaltyInfoChanged(
            _tokenId,
            _royaltyReceiver,
            _feePercent
        );
    }

    /// @notice Function to mint new tokens
    /// @dev Can only be called by project owner
    /// @param _to Mint address destination
    /// @param _id Mint token id
    /// @param _amount Mint token amount
    function mint(
        address _to,
        uint _id,
        uint _amount
    ) external onlyOwner {
        _mint(_to, _id, _amount, "");
    }

    /// @notice Function to mint batch tokens
    /// @dev Can only be called by project owner
    /// @param _to Mint address destination
    /// @param _ids Mint token ids
    /// @param _amounts Mint token amounts
    function mintBatch(
        address _to,
        uint[] memory _ids,
        uint[] memory _amounts
    ) external onlyOwner {
        _mintBatch(_to, _ids, _amounts, "");
    }

    /// @notice Function to burn token
    /// @param _id Token id to be burned
    /// @param _amount Token amount to be burned
    function burn(uint _id, uint _amount) external {
        _burn(msg.sender, _id, _amount);
    }

    /// @notice Function to burn batch token
    /// @param _ids Token ids to be burned
    /// @param _amounts Token amounts to be burned
    function burnBatch(uint[] memory _ids, uint[] memory _amounts) external {
        _burnBatch(msg.sender, _ids, _amounts);
    }

    function burnForMint(
        address _from,
        uint[] memory _burnIds,
        uint[] memory _burnAmounts,
        uint[] memory _mintIds,
        uint[] memory _mintAmounts
    ) external onlyOwner {
        _burnBatch(_from, _burnIds, _burnAmounts);
        _mintBatch(_from, _mintIds, _mintAmounts, "");
    }

    /// @notice Function to set token uri
    /// @dev Can only be called by project owner
    /// @param _id Token id
    /// @param _uri Token uri
    function setURI(uint _id, string memory _uri) public onlyOwner {
        tokenURI[_id] = _uri;
        emit URI(_uri, _id);
    }

    /// @notice Function to get token uri
    /// @param _id Token id
    /// @return string Token uri
    function uri(uint _id) public view override returns (string memory) {
        return tokenURI[_id];
    }

    /// @notice Returns true if this contract implements the interface defined by `interfaceId`
    /// @dev Needs to be overridden cause two base contracts implement it
    /// @param _interfaceId InterfaceId to consider. Comes from type(InterfaceContract).interfaceId
    /// @return bool True if the considered interface is supported
    function supportsInterface(bytes4 _interfaceId)
        public
        view
        virtual
        override(ERC1155Upgradeable, ERC2981Upgradeable)
        returns (bool)
    {
        return
            ERC1155Upgradeable.supportsInterface(_interfaceId) ||
            ERC2981Upgradeable.supportsInterface(_interfaceId) ||
            super.supportsInterface(_interfaceId);
    }
}
