// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import {Errors} from "./libraries/Errors.sol";

import "./interfaces/IERC721A.sol";
import "./interfaces/IERC1155.sol";
import "./interfaces/IWizardStorage.sol";

/// @title Wizard Factory
/// @notice Factory that creates ERC contracts
contract WizardFactory is Ownable, ReentrancyGuard {
    /// @notice Emitted on ERC Contracts create
    /// @param createdContract Address of deployed Contract
    /// @param name Contract name
    /// @param symbol Contract symbol
    /// @param royaltyReceiver Royalty fee collector
    /// @param contractOwner Contract owner
    event ContractCreated(
        address indexed createdContract,
        string name,
        string symbol,
        ERCType contractType,
        address indexed royaltyReceiver,
        address indexed contractOwner
    );

    /// @notice ERC contract types
    enum ERCType {
        ERC721A,
        ERC1155
    }

    /// @notice Contract deployment cost in wei as usd
    int public cost;

    /// @notice AggregatorV3Interface priceFeed address
    AggregatorV3Interface public priceFeed;

    /// @notice Wizard Storage Implementation
    address public WizardStorageImplementation;

    /// @notice ERC721A contract to be cloned
    address public ERC721AImplementation;

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
    function createERC721AContract(
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
            revert Errors.InsufficientFunds();
        }

        if (ERC721AImplementation == address(0)) {
            revert Errors.InvalidERC721AImplementation();
        }

        address createdContract = Clones.clone(ERC721AImplementation);
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

        IWizardStorage(WizardStorageImplementation).addCreatedContract(msg.sender, uint8(ERCType.ERC721A), createdContract);

        emit ContractCreated(
            createdContract,
            _name,
            _symbol,
            ERCType.ERC721A,
            _royaltyReceiver,
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
            revert Errors.InsufficientFunds();
        }

        if (ERC1155Implementation == address(0)) {
            revert Errors.InvalidERC1155Implementation();
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

        IWizardStorage(WizardStorageImplementation).addCreatedContract(msg.sender, uint8(ERCType.ERC1155), createdContract);

        emit ContractCreated(
            createdContract,
            _name,
            _symbol,
            ERCType.ERC1155,
            _royaltyReceiver,
            msg.sender
        );
    }

    /// @notice Set address for WizardStorageImplementation
    /// @param _wizardStorageImplementation New WizardStorageImplementation
    function setWizardStorageImplementation(address _wizardStorageImplementation)
        external
        onlyOwner
    {
        if (_wizardStorageImplementation == address(0)) {
            revert Errors.InvalidStorageImplementation();
        }

        WizardStorageImplementation = _wizardStorageImplementation;
    }

    /// @notice Set address for ERC721AImplementation
    /// @param _ercImplementation New ERC721AImplementation
    function setERC721AImplementation(address _ercImplementation)
        external
        onlyOwner
    {
        if (_ercImplementation == address(0)) {
            revert Errors.InvalidERC721AImplementation();
        }

        ERC721AImplementation = _ercImplementation;
        emit SetERCImplementation(_ercImplementation);
    }

    /// @notice Set address for ERC1155Implementation
    /// @param _ercImplementation New ERC1155Implementation
    function setERC1155Implementation(address _ercImplementation)
        external
        onlyOwner
    {
        if (_ercImplementation == address(0)) {
            revert Errors.InvalidERC1155Implementation();
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
    /// @param _cost Cost in wei 18 dec as usd
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
    function getCost() public view returns (uint) {
        int tokenAmount = (cost * 1e18) / getLatestPrice();
        return uint(tokenAmount);
    }

    /// @notice Function to withdraw contract funds
    function withdraw() public onlyOwner nonReentrant {
        (bool os, ) = payable(owner()).call{value: address(this).balance}("");
        require(os);
    }
}
