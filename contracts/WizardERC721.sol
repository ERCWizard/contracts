// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "erc721a-upgradeable/contracts/ERC721AUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/common/ERC2981Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "./WizardErrors.sol";

/// @title Wizard ERC721 Contract
/// @author a6Ce6Bs
/// @notice ERC721A contract
contract ERC721 is ERC721AUpgradeable, OwnableUpgradeable, ERC2981Upgradeable, ReentrancyGuardUpgradeable {
    /// @notice Contract merkle root
    bytes32 public merkleRoot;

    /// @notice Mapping of address to whitelist claimed bool
    mapping(address => bool) public whitelistClaimed;

    /// @notice Contract uri prefix
    string public uriPrefix;

    /// @notice Contract uri suffix
    string public uriSuffix;

    /// @notice Contract hidden metadata uri
    string public hiddenMetadataUri;
    
    /// @notice Mint cost
    uint256 public cost;

    /// @notice Contract maxSupply
    uint256 public maxSupply;

    /// @notice Max mint amount per transaction
    uint256 public maxMintAmountPerTx;

    /// @notice Contract status state
    bool public paused;

    /// @notice Contract whitelist mint state
    bool public whitelistMintEnabled;

    /// @notice Contract revealed state
    bool public revealed;

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

    /// @notice Emmited on initialize()
    /// @param _tokenName Contract name
    /// @param _tokenSymbol Contract symbol
    /// @param _cost Contract mint cost
    /// @param _maxSupply Contract maxSupply
    /// @param _maxMintAmountPerTx Max mint amount per transaction
    /// @param _hiddenMetadataUri Hidden metadata uri
    /// @param _uriPrefix Metadata uri prefix
    /// @param _royaltyReceiver Royalty fee collector
    /// @param _feePercent Royalty fee numerator; denominator is 10,000. So 500 represents 5%
    /// @param _contractOwner Contract owner
    event InitializedContract(
        string indexed _tokenName,
        string indexed _tokenSymbol,
        uint256 _cost,
        uint256 _maxSupply,
        uint256 _maxMintAmountPerTx,
        string _hiddenMetadataUri,
        string _uriPrefix,
        address _royaltyReceiver,
        uint96 _feePercent,
        address indexed _contractOwner
    );

    /// @notice Contract initialization
    /// @param _tokenName Contract name
    /// @param _tokenSymbol Contract symbol
    /// @param _cost Contract mint cost
    /// @param _maxSupply Contract maxSupply
    /// @param _maxMintAmountPerTx Max mint amount per transaction
    /// @param _hiddenMetadataUri Hidden metadata uri
    /// @param _uriPrefix Metadata uri prefix
    /// @param _royaltyReceiver Royalty fee collector
    /// @param _feePercent Royalty fee numerator; denominator is 10,000. So 500 represents 5%
    /// @param _contractOwner Contract owner
    function initialize(
        string memory _tokenName,
        string memory _tokenSymbol,
        uint256 _cost,
        uint256 _maxSupply,
        uint256 _maxMintAmountPerTx,
        string memory _hiddenMetadataUri,
        string memory _uriPrefix,
        address _royaltyReceiver,
        uint96 _feePercent,
        address _contractOwner
    ) external initializer {
        __Ownable_init();
        __ERC2981_init();
        __ReentrancyGuard_init();
        __ERC721A_init(_tokenName, _tokenSymbol);
        cost = _cost;
        maxSupply = _maxSupply;
        setMaxMintAmountPerTx(_maxMintAmountPerTx);
        setHiddenMetadataUri(_hiddenMetadataUri);
        setUriPrefix(_uriPrefix);
        setRoyaltyInfo(_royaltyReceiver, _feePercent);
        transferOwnership(_contractOwner);
        uriSuffix = '.json';
        paused = true;

        emit InitializedContract(
            _tokenName,
            _tokenSymbol,
            _cost,
            _maxSupply,
            _maxMintAmountPerTx,
            _hiddenMetadataUri,
            _uriPrefix,
            _royaltyReceiver,
            _feePercent,
            _contractOwner
        );
    }

    modifier mintCompliance(uint256 _mintAmount) {
        if (_mintAmount <= 0 || _mintAmount > maxMintAmountPerTx) {
            revert ERC721__InvalidMintAmount();
        }
        if (totalSupply() + _mintAmount > maxSupply) {
            revert ERC721__MaxSupplyExceeded();
        }
        _;
    }

    modifier mintPriceCompliance(uint256 _mintAmount) {
        if (msg.value < cost * _mintAmount) {
            revert ERC721__InsufficientFunds();
        }
        _;
    }

    /// @notice Function to whitelist mint new tokens
    /// @param _mintAmount Amount of tokens to be minted
    /// @param _merkleProof Merkle proof to verify whitelisted address
    function whitelistMint(
        uint256 _mintAmount, 
        bytes32[] calldata _merkleProof
    ) public payable mintCompliance(_mintAmount) mintPriceCompliance(_mintAmount) {
        if (!whitelistMintEnabled) {
            revert ERC721__TheWhitelistSaleIsNotEnabled();
        }
        if (whitelistClaimed[_msgSender()]) {
            revert ERC721__AddressAlreadyClaimed();
        }
        bytes32 leaf = keccak256(abi.encodePacked(_msgSender()));
        if (!MerkleProof.verify(_merkleProof, merkleRoot, leaf)) {
            revert ERC721__InvalidProof();
        }

        whitelistClaimed[_msgSender()] = true;
        _safeMint(_msgSender(), _mintAmount);
    }

    /// @notice Function to mint new tokens
    /// @param _mintAmount Amount of tokens to be minted
    function mint(
        uint256 _mintAmount
    ) public payable mintCompliance(_mintAmount) mintPriceCompliance(_mintAmount) {
        if (paused) {
            revert ERC721__TheContractIsPaused();
        }

        _safeMint(_msgSender(), _mintAmount);
    }
    
    /// @notice Function to mint new tokens for address
    /// @param _mintAmount Amount of tokens to be minted
    /// @param _receiver Receiver address
    function mintForAddress(
        uint256 _mintAmount, 
        address _receiver
    ) public mintCompliance(_mintAmount) onlyOwner {
        _safeMint(_receiver, _mintAmount);
    }

    /// @notice Function for getting list of owned token ids
    /// @param _owner Address of wallet owner
    /// @return uint256 Owned token ids
    function walletOfOwner(
        address _owner
    ) public view returns (uint256[] memory) {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory ownedTokenIds = new uint256[](ownerTokenCount);
        uint256 currentTokenId = _startTokenId();
        uint256 ownedTokenIndex = 0;
        address latestOwnerAddress;

        while (ownedTokenIndex < ownerTokenCount && currentTokenId <= maxSupply) {
        TokenOwnership memory ownership = _ownerships[currentTokenId];

        if (!ownership.burned && ownership.addr != address(0)) {
            latestOwnerAddress = ownership.addr;
        }

        if (latestOwnerAddress == _owner) {
            ownedTokenIds[ownedTokenIndex] = currentTokenId;

            ownedTokenIndex++;
        }

        currentTokenId++;
        }

        return ownedTokenIds;
    }

    /// @notice Function to initialize tokenId to 1
    /// @return uint256 Token id
    function _startTokenId() internal view virtual override returns (uint256) {
        return 1;
    }

    /// @notice Function to get token uri
    /// @param _tokenId Token id
    /// @return string Token uri
    function tokenURI(
        uint256 _tokenId
    ) public view virtual override returns (string memory) {
        if (!_exists(_tokenId)) {
            revert ERC721__URIQueryForNonexistentToken();
        }

        if (revealed == false) {
            return hiddenMetadataUri;
        }

        string memory currentBaseURI = _baseURI();
        return bytes(currentBaseURI).length > 0
            ? string(abi.encodePacked(currentBaseURI, '/', Strings.toString(_tokenId), uriSuffix))
            : '';
    }

    /// @notice Function for changing royalty information
    /// @dev Can only be called by project owner
    /// @dev Owner can prevent any sale by setting the address to any address that can't receive native network token
    /// @param _royaltyReceiver Royalty fee collector
    /// @param _feePercent Royalty fee numerator; denominator is 10,000. So 500 represents 5%
    function setRoyaltyInfo(
        address _royaltyReceiver, 
        uint96 _feePercent
    ) public onlyOwner {
        _setDefaultRoyalty(_royaltyReceiver, _feePercent);
        emit RoyaltyInfoChanged(_royaltyReceiver, _feePercent);
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
        emit TokenRoyaltyInfoChanged(_tokenId, _royaltyReceiver, _feePercent);
    }

    /// @notice Function for changing revealed state
    /// @dev Can only be called by project owner
    /// @param _state Revealed state to be set
    function setRevealed(
        bool _state
    ) public onlyOwner {
        revealed = _state;
    }

    /// @notice Function for changing cost price
    /// @dev Can only be called by project owner
    /// @param _cost Cost price to be set
    function setCost(
        uint256 _cost
    ) public onlyOwner {
        cost = _cost;
    }

    /// @notice Function for changing max mint amount per tx
    /// @dev Can only be called by project owner
    /// @param _maxMintAmountPerTx Max mint amount per tx to be set
    function setMaxMintAmountPerTx(
        uint256 _maxMintAmountPerTx
    ) public onlyOwner {
        maxMintAmountPerTx = _maxMintAmountPerTx;
    }

    /// @notice Function for changing hidden metadata uri
    /// @dev Can only be called by project owner
    /// @param _hiddenMetadataUri Hidden metadata uri to be set
    function setHiddenMetadataUri(
        string memory _hiddenMetadataUri
    ) public onlyOwner {
        hiddenMetadataUri = _hiddenMetadataUri;
    }

    /// @notice Function for changing uri prefix
    /// @dev Can only be called by project owner
    /// @param _uriPrefix Uri prefix to be set
    function setUriPrefix(
        string memory _uriPrefix
    ) public onlyOwner {
        uriPrefix = _uriPrefix;
    }

    /// @notice Function for changing uri suffix
    /// @dev Can only be called by project owner
    /// @param _uriSuffix Uri suffix to be set
    function setUriSuffix(
        string memory _uriSuffix
    ) public onlyOwner {
        uriSuffix = _uriSuffix;
    }

    /// @notice Function for changing paused state
    /// @dev Can only be called by project owner
    /// @param _state Paused state to be set
    function setPaused(
        bool _state
    ) public onlyOwner {
        paused = _state;
    }

    /// @notice Function for changing merkle root
    /// @dev Can only be called by project owner
    /// @param _merkleRoot Merkle root to be set
    function setMerkleRoot(
        bytes32 _merkleRoot
    ) public onlyOwner {
        merkleRoot = _merkleRoot;
    }

    /// @notice Function for changing whitelist state
    /// @dev Can only be called by project owner
    /// @param _state Whitelist state to be set
    function setWhitelistMintEnabled(
        bool _state
    ) public onlyOwner {
        whitelistMintEnabled = _state;
    }

    /// @notice Function for withdrawing contact funds
    /// @dev Can only be called by project owner
    function withdraw() public onlyOwner nonReentrant {
        (bool os, ) = payable(owner()).call{value: address(this).balance}('');
        require(os);
    }

    /// @notice Function to get uri prefix
    /// @return string Uri prefix
    function _baseURI() internal view virtual override returns (string memory) {
        return uriPrefix;
    }

    /// @notice Returns true if this contract implements the interface defined by `interfaceId`
    /// @dev Needs to be overridden cause two base contracts implement it
    /// @param _interfaceId InterfaceId to consider. Comes from type(InterfaceContract).interfaceId
    /// @return bool True if the considered interface is supported
    function supportsInterface(bytes4 _interfaceId)
        public
        view
        virtual
        override(ERC721AUpgradeable, ERC2981Upgradeable)
        returns (bool)
    {
        return
            ERC721AUpgradeable.supportsInterface(_interfaceId) ||
            ERC2981Upgradeable.supportsInterface(_interfaceId) ||
            super.supportsInterface(_interfaceId);
    }
}