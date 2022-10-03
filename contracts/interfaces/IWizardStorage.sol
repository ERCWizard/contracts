//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

/// @title WizardStorage
/// @notice Defines the interface of WizardStorage
interface IWizardStorage {
    function addCreatedContract(
        address _deployer,
        uint8 _ERCType,
        address _addr
    ) external;
}
