// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "./WizardErrors.sol";
import "./interfaces/IERC721.sol";
import "./interfaces/IERC1155.sol";

/// @title Wizard Factory
/// @author a6Ce6Bs
/// @notice Factory that creates ERC contracts
contract WizardFactory is Ownable, ReentrancyGuard {
    /// @notice Emitted on createERC721Contract()
    /// @param createdContract Address of deployed Contract
    /// @param name Contract (ERC721) name
    /// @param symbol Contract (ERC721) symbol
    /// @param cost Mint cost
    /// @param maxSupply Contract (ERC721) maxSupply
    /// @param maxMintAmountPerTx Max mint amount per transaction
    /// @param hiddenMetadataUri Hidden metadata uri
    /// @param uriPrefix Metadata uri prefix
    /// @param royaltyReceiver Royalty fee collector
    /// @param royaltyFee Royalty fee numerator
    /// @param contractOwner Contract owner
    event ERC721ContractCreated(
        address indexed createdContract,
        string name,
        string symbol,
        uint256 cost,
        uint256 maxSupply,
        uint256 maxMintAmountPerTx,
        string hiddenMetadataUri,
        string uriPrefix,
        address indexed royaltyReceiver,
        uint96 royaltyFee,
        address indexed contractOwner
    );

    /// @notice Emitted on createERC1155Contract()
    /// @param createdContract Address of deployed Contract
    /// @param name Contract (ERC1155) name
    /// @param symbol Contract (ERC1155) symbol
    /// @param id Token id
    /// @param amount Token supply
    /// @param uri Token uri
    /// @param royaltyReceiver Royalty fee collector
    /// @param royaltyFee Royalty fee numerator
    /// @param contractOwner Contract owner
    event ERC1155ContractCreated(
        address indexed createdContract,
        string name,
        string symbol,
        uint256 id,
        uint256 amount,
        string uri,
        address indexed royaltyReceiver,
        uint96 royaltyFee,
        address indexed contractOwner
    );

    /// @notice ERC contract types
    enum ERCType { 
        ERC721, 
        ERC1155
    }

    /// @notice Created ERC contract
    struct CreatedContract { 
        ERCType _type;
        address _address;
    }

    /// @notice Contract deployment cost in USD as wei
    int public cost;

    /// @notice AggregatorV3Interface priceFeed address
    AggregatorV3Interface public priceFeed;

    /// @notice Array of all deployed contract addresses
    address[] public allCreatedContracts;

    /// @notice Mapping of address (deployer) to created contracts
    mapping(address => CreatedContract[]) public createdContracts;

    /// @notice ERC721 contract to be cloned
    address public ERC721Implementation;

    /// @notice ERC1155 contract to be cloned
    address public ERC1155Implementation;

    /// @notice Emmited on one of setERCImplementation()
    /// @param ercImplementation implementation of contract
    event SetERCImplementation(address indexed ercImplementation);

    /// @notice Constructor
    /// @param _cost Contract deployment cost
    /// @param priceFeedAddress AggregatorV3Interface priceFeed address
    constructor(int _cost, address priceFeedAddress) {
        cost = _cost;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    /// @notice Function for creating ERC721 contracts
    /// @param _name Contract (ERC721) name
    /// @param _symbol Contract (ERC721) symbol
    /// @param _cost Mint cost
    /// @param _maxSupply Contract (ERC721) maxSupply
    /// @param _maxMintAmountPerTx Max mint amount per transaction
    /// @param _hiddenMetadataUri Hidden metadata uri
    /// @param _uriPrefix Metadata uri prefix
    /// @param _royaltyReceiver Royalty fee collector
    /// @param _feePercent Royalty fee numerator; denominator is 10,000. So 500 represents 5%
    function createERC721Contract(
        string memory _name,
        string memory _symbol,
        uint256 _cost,
        uint256 _maxSupply,
        uint256 _maxMintAmountPerTx,
        string memory _hiddenMetadataUri,
        string memory _uriPrefix,
        address _royaltyReceiver,
        uint96 _feePercent
    ) public payable {
        if (msg.value < getCost()) {
            revert WizardFactory__InsufficientFunds();
        }

        if (ERC721Implementation == address(0)) {
            revert WizardFactory__InvalidERC721Implementation();
        }

        address createdContract = Clones.clone(ERC721Implementation);
        IERC721(createdContract).initialize(
            _name,
            _symbol,
            _cost,
            _maxSupply,
            _maxMintAmountPerTx,
            _hiddenMetadataUri,
            _uriPrefix,
            _royaltyReceiver,
            _feePercent,
            msg.sender
        );

        allCreatedContracts.push(createdContract);

        createdContracts[msg.sender].push(
            CreatedContract({ _type: ERCType.ERC721, _address: createdContract })
        );

        emit ERC721ContractCreated(
            createdContract,
            _name,
            _symbol,
            _cost,
            _maxSupply,
            _maxMintAmountPerTx,
            _hiddenMetadataUri,
            _uriPrefix,
            _royaltyReceiver,
            _feePercent,
            msg.sender
        );
    }

    /// @notice Function for creating ERC1155 contracts
    /// @param _name Contract (ERC1155) name
    /// @param _symbol Contract (ERC1155) symbol
    /// @param _id Token id
    /// @param _amount Token supply
    /// @param _uri Token uri
    /// @param _royaltyReceiver Royalty fee collector
    /// @param _feePercent Royalty fee numerator; denominator is 10,000. So 500 represents 5%
    function createERC1155Contract(
        string memory _name,
        string memory _symbol,
        uint256 _id,
        uint256 _amount,
        string memory _uri,
        address _royaltyReceiver,
        uint96 _feePercent
    ) public payable {
        if (msg.value < getCost()) {
            revert WizardFactory__InsufficientFunds();
        }

        if (ERC1155Implementation == address(0)) {
            revert WizardFactory__InvalidERC1155Implementation();
        }

        address createdContract = Clones.clone(ERC1155Implementation);
        IERC1155(createdContract).initialize(
            _name,
            _symbol,
            _id,
            _amount,
            _uri,
            _royaltyReceiver,
            _feePercent,
            msg.sender
        );

        allCreatedContracts.push(createdContract);

        createdContracts[msg.sender].push(
            CreatedContract({ _type: ERCType.ERC1155, _address: createdContract })
        );

        emit ERC1155ContractCreated(
            createdContract,
            _name,
            _symbol,
            _id,
            _amount,
            _uri,
            _royaltyReceiver,
            _feePercent,
            msg.sender
        );
    }

    /// @notice Set address for ERC721Implementation
    /// @param _ercImplementation New ERC721Implementation
    function setERC721Implementation(address _ercImplementation) external onlyOwner {
        if (_ercImplementation == address(0)) {
            revert WizardFactory__InvalidERC721Implementation();
        }

        ERC721Implementation = _ercImplementation;
        emit SetERCImplementation(_ercImplementation);
    }

    /// @notice Set address for ERC1155Implementation
    /// @param _ercImplementation New ERC1155Implementation
    function setERC1155Implementation(address _ercImplementation) external onlyOwner {
        if (_ercImplementation == address(0)) {
            revert WizardFactory__InvalidERC1155Implementation();
        }

        ERC1155Implementation = _ercImplementation;
        emit SetERCImplementation(_ercImplementation);
    }

    /// @notice Set address for AggregatorV3Interface
    /// @param _priceFeedAddress PriceFeed address
    function setPriceFeed(address _priceFeedAddress) public onlyOwner {
        priceFeed = AggregatorV3Interface(_priceFeedAddress);
    }

    /// @notice Set contract deployment cost
    /// @param _cost Cost in wei 18 dec
    function setCost(int _cost) public onlyOwner {
        cost = _cost;
    }

    /// @notice Function to get latest network native token price
    /// @return int256 Equation of price * 1e10
    function getLatestPrice() public view returns (int) {
        (/*uint80 roundID*/,int price,/*uint startedAt*/,/*uint timeStamp*/,/*uint80 answeredInRound*/) = priceFeed.latestRoundData();
        return price * 1e10;
    }

    /// @notice Function to get contract deployment cost
    /// @return uint256 Cost price for contract deployment
    function getCost() public view returns(uint) {
        int tokenAmount = (cost * 1e18) / getLatestPrice();
        return uint(tokenAmount);
    }

    /// @notice Function to get number of deployed contracts
    /// @return uint256 number of all deployed contracts
    function getTotalCreatedContracts() external view returns (uint256) {
        return allCreatedContracts.length;
    }

    /// @notice Function to get all deployed contracts by an address
    /// @param _address Address of contract deployer
    function getCreatedContracts(address _address) public view returns(CreatedContract[] memory) {
        return createdContracts[_address];
    }

    /// @notice Function to withdraw contract funds
    function withdraw() public onlyOwner nonReentrant {
        (bool os, ) = payable(owner()).call{value: address(this).balance}('');
        require(os);
    }
}