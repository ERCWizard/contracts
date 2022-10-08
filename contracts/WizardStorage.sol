// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";

import {Errors} from "./libraries/Errors.sol";
import {Enums} from "./libraries/Enums.sol";

/// @title Wizard Storage
/// @notice Storage that store contracts
contract WizardStorage is Ownable {
    address public factory;

    /// @notice Created contract
    struct CreatedContract {
        Enums.Standard standard;
        Enums.Tier tier;
        address address_;
    }

    /// @notice Mapping of address (deployer) to created contracts
    mapping(address => CreatedContract[]) public createdContracts;

    /// @notice Constructor
    /// @param _factory factory address
    constructor(address _factory) {
        factory = _factory;
    }

    /// @notice Function to store created contract data
    /// @param _deployer Deployer address
    /// @param _standard Contract standard
    /// @param _tier Contract standard tier
    /// @param _address Created contract address
    function storeCreatedContract(
        address _deployer,
        Enums.Standard _standard,
        Enums.Tier _tier,
        address _address
    ) external {
        if(factory != msg.sender) {
            revert Errors.CallerIsNotTheFactory();
        }

        createdContracts[_deployer].push(
            CreatedContract({ standard: _standard, tier: _tier, address_: _address })
        );
    }

    /// @notice Function to set the factory address
    /// @param _factory Factory address
    function setFactoryAddress(address _factory) external onlyOwner {
        factory = _factory;
    }

    /// @notice Function to get all deployed contracts by an address
    /// @param _address Address of contract deployer
    function getCreatedContracts(address _address)
        public
        view
        returns (CreatedContract[] memory)
    {
        return createdContracts[_address];
    }
}
