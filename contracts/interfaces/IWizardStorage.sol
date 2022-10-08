//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import {Enums} from "../libraries/Enums.sol";

/// @title IWizardStorage
/// @notice Defines the interface of WizardStorage
interface IWizardStorage {
  function storeCreatedContract(
    address _deployer,
    Enums.Standard _standard,
    Enums.Tier _tier,
    address _address
  ) external;
}