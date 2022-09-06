# ERCWizard contracts

ERCWizard Solidity Smart Contracts

This repository contains three contracts:

- **ERC721** implements upgradable contracts of [ERC721A](https://github.com/chiru-labs/ERC721A-Upgradeable) and [ERC2981](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/master/contracts/token/common/ERC2981Upgradeable.sol).
- **ERC1155** implements upgradable contracts of [ERC1155](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC1155/ERC1155.sol) and [ERC2981](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/master/contracts/token/common/ERC2981Upgradeable.sol).
- **WizardFactory** allows for creating and keeping track of **ERC721** and **ERC1155** contracts. It uses the contract cloning technique implemented in [OpenZeppelin Proxy Clone](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/proxy/Clones.sol) which optimizes the gas used in creating new contracts.

## How does it work?

### Contracts

#### ERC721

Contract that implements `ERC721A` and `ERC2981` contracts. It allows to `mint` new tokens.

#### ERC1155

Contract that implements `ERC1155` and `ERC2981` contracts. It allows only contract owner to `mint` new tokens.

#### WizardFactory

Contract factory that deploy and keep track of `ERC721 & ERC1155` contracts.

## Setup

Use Hardhat to develop, compile, test and deploy contracts.

```
# install dependencies
npm install
```

## Testing

```
npm test # run test
npx hardhat coverage # run coverage report from solidity-coverage
```

## Environment variables

To run this project, you will need to add the following environment variables to your `.env` file:

```
# The contract deployer
DEPLOY_PRIVATE_KEY=
# The alchemy polygon rpc url
POLYGON_ALCHEMY_RPC_URL=
# The alchemy mumbai rpc url
MUMBAI_ALCHEMY_RPC_URL=
```

## Test coverage

| File              | % Stmts | % Branch | % Funcs | % Lines |
| ----------------- | ------- | -------- | ------- | ------- |
| WizardERC1155.sol | 78.26   | 100      | 72.73   | 78.26   |
| WizardERC721.sol  | 93.44   | 95.83    | 86.96   | 94.52   |
| WizardErrors.sol  | 100     | 100      | 100     | 100     |
| WizardFactory.sol | 100     | 78.57    | 100     | 94.74   |
| **All files**     | 92.24   | 89.47    | 86.96   | 91.79   |

Coverage was calculated by the `solidity-coverage` plugin from hardhat.
