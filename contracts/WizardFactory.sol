// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import {Errors} from "./libraries/Errors.sol";
import {Enums} from "./libraries/Enums.sol";

import "./interfaces/IERC721A.sol";
import "./interfaces/IERC1155.sol";
import "./interfaces/IWizardStorage.sol";

/// @title Wizard Factory
/// @notice Factory that creates contracts
contract WizardFactory is Ownable, ReentrancyGuard {
    /// @notice Emitted on ERC Contracts create
    /// @param contractAddress Address of deployed Contract
    /// @param name Contract name
    /// @param symbol Contract symbol
    /// @param standard Contract standard
    /// @param tier Contract standard tier
    /// @param owner Contract owner
    event ContractCreated(
        address indexed contractAddress,
        string name,
        string symbol,
        Enums.Standard standard,
        Enums.Tier tier,
        address indexed owner
    );

    /// @notice AggregatorV3Interface priceFeed address
    AggregatorV3Interface public priceFeed;

    /// @notice Storage Implementation
    address public storageImplementation;

    /// @notice standard: ERC721A => tier: Basic => implementation address
    mapping(Enums.Standard => mapping (Enums.Tier => address)) public contractImplementation;

    /// @notice tier => cost in wei as usd
    mapping(Enums.Tier => int) public cost;

    /// @notice Constructor
    /// @param _basicTierCost Basic tier cost
    /// @param _premiumTierCost Premium tier cost
    /// @param _advancedTierCost Advanced tier cost
    /// @param _priceFeed AggregatorV3Interface priceFeed address
    constructor(
        int _basicTierCost,
        int _premiumTierCost,
        int _advancedTierCost,
        address _priceFeed
    ) {
        cost[Enums.Tier.Basic] = _basicTierCost;
        cost[Enums.Tier.Premium] = _premiumTierCost;
        cost[Enums.Tier.Advanced] = _advancedTierCost;
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    modifier createCompliance(Enums.Standard _standard, Enums.Tier _tier) {
        if (msg.value < getCost(_tier)) {
            revert Errors.InsufficientFunds();
        }
        if (contractImplementation[_standard][_tier] == address(0)) {
            revert Errors.InvalidContractImplementation(_standard, _tier);
        }
        _;
    }

    /// @notice Function for creating ERC721A contracts
    /// @param _name Contract name
    /// @param _symbol Contract symbol
    /// @param _cost Mint cost
    /// @param _maxSupply Contract maxSupply
    /// @param _maxMintAmountPerTx Max mint amount per transaction
    /// @param _hiddenMetadataUri Hidden metadata uri
    /// @param _uriPrefix Metadata uri prefix
    /// @param _royaltyReceiver Royalty fee collector
    /// @param _feePercent Royalty fee numerator; denominator is 10,000. So 500 represents 5%
    /// @param _tier Contract standard tier
    function createERC721AContract(
        string memory _name,
        string memory _symbol,
        uint256 _cost,
        uint256 _maxSupply,
        uint256 _maxMintAmountPerTx,
        string memory _hiddenMetadataUri,
        string memory _uriPrefix,
        address _royaltyReceiver,
        uint96 _feePercent,
        Enums.Tier _tier
    ) public payable createCompliance(Enums.Standard.ERC721A, _tier) {
        address createdContract = Clones.clone(
            contractImplementation[Enums.Standard.ERC721A][_tier]
        );

        IERC721A(createdContract).initialize(
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

        IWizardStorage(storageImplementation).storeCreatedContract(
            msg.sender,
            Enums.Standard.ERC721A,
            _tier,
            createdContract
        );

        emit ContractCreated(
            createdContract,
            _name,
            _symbol,
            Enums.Standard.ERC1155,
            _tier,
            msg.sender
        );
    }

    /// @notice Function for creating ERC1155 contracts
    /// @param _name Contract name
    /// @param _symbol Contract symbol
    /// @param _id Token id
    /// @param _amount Token supply
    /// @param _uri Token uri
    /// @param _royaltyReceiver Royalty fee collector
    /// @param _feePercent Royalty fee numerator; denominator is 10,000. So 500 represents 5%
    /// @param _tier Contract standard tier
    function createERC1155Contract(
        string memory _name,
        string memory _symbol,
        uint256 _id,
        uint256 _amount,
        string memory _uri,
        address _royaltyReceiver,
        uint96 _feePercent,
        Enums.Tier _tier
    ) public payable createCompliance(Enums.Standard.ERC1155, _tier) {
        address createdContract = Clones.clone(
            contractImplementation[Enums.Standard.ERC1155][_tier]
        );

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

        IWizardStorage(storageImplementation).storeCreatedContract(
            msg.sender,
            Enums.Standard.ERC1155,
            _tier,
            createdContract
        );

        emit ContractCreated(
            createdContract,
            _name,
            _symbol,
            Enums.Standard.ERC1155,
            _tier,
            msg.sender
        );
    }

    /// @notice Set address for storageImplementation
    /// @param _storageImplementation New storageImplementation
    function setStorageImplementation(
        address _storageImplementation
    )
        external
        onlyOwner
    {
        if (_storageImplementation == address(0)) {
            revert Errors.InvalidStorageImplementation();
        }

        storageImplementation = _storageImplementation;
    }

    /// @notice Set address for WizardStorageImplementation
    /// @param _contractImplementation New contractImplementation
    function setContractImplementation(
        Enums.Standard _standard,
        Enums.Tier _tier,
        address _contractImplementation
    )
        external
        onlyOwner
    {
        if (_contractImplementation == address(0)) {
            revert Errors.InvalidContractImplementation(_standard, _tier);
        }

        contractImplementation[_standard][_tier] = _contractImplementation;
    }

    /// @notice Set address for AggregatorV3Interface
    /// @param _priceFeedAddress PriceFeed address
    function setPriceFeed(address _priceFeedAddress) public onlyOwner {
        priceFeed = AggregatorV3Interface(_priceFeedAddress);
    }

    /// @notice Set contract basic deployment cost
    /// @param _cost Cost in wei (18 dec) as usd
    function setCost(Enums.Tier _tier, int _cost) public onlyOwner {
        cost[_tier] = _cost;
    }

    /// @notice Function to get latest network native token price
    /// @return int256 Equation of price * 1e10
    function getLatestPrice() public view returns (int) {
        (/*uint80 roundID*/,int price,/*uint startedAt*/,/*uint timeStamp*/,/*uint80 answeredInRound*/) = priceFeed.latestRoundData();
        return price * 1e10;
    }

    /// @notice Function to get contract deployment cost
    /// @return uint256 Cost price for contract deployment
    function getCost(Enums.Tier _tier) public view returns (uint) {
        int tokenAmount = (cost[_tier] * 1e18) / getLatestPrice();
        return uint(tokenAmount);
    }

    /// @notice Function to withdraw contract funds
    function withdraw() public onlyOwner nonReentrant {
        (bool os, ) = payable(owner()).call{value: address(this).balance}("");
        require(os);
    }
}