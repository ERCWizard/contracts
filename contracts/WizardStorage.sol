// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";

import {Errors} from "./libraries/Errors.sol";

/// @title Wizard Storage
/// @notice Storage that store ERC contracts
contract WizardStorage is Ownable {
    address public factory;

    /// @notice Created ERC contract
    struct CreatedContract {
        uint8 _type;
        address _address;
    }

    /// @notice Mapping of address (deployer) to created contracts
    mapping(address => CreatedContract[]) public createdContracts;

    /// @notice Constructor
    /// @param _factory factory address
    constructor(address _factory) {
        factory = _factory;
    }

    function addCreatedContract(address _deployer, uint8 _ERCType, address _addr) external {
        if(factory != msg.sender) {
            revert Errors.CallerIsNotTheFactory();
        }

        createdContracts[_deployer].push(
            CreatedContract({_type: _ERCType, _address: _addr})
        );
    }

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
