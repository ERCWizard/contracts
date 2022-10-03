# ERCWizard contracts

ERCWizard Solidity Smart Contracts:

- **ERC721A** implements upgradable contracts of [ERC721A](https://github.com/chiru-labs/ERC721A-Upgradeable) and [ERC2981](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/master/contracts/token/common/ERC2981Upgradeable.sol).
- **ERC1155** implements upgradable contracts of [ERC1155](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC1155/ERC1155.sol) and [ERC2981](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/master/contracts/token/common/ERC2981Upgradeable.sol).
- **WizardFactory** allows for creating **ERC721A** and **ERC1155** contracts. It uses the contract cloning technique implemented in [OpenZeppelin Proxy Clone](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/proxy/Clones.sol) which optimizes the gas used in creating new contracts.
- **WizardStorage** allows for keeping track of created contracts.

## How does it work?

### Contracts

#### ERC721A

Contract that implements `ERC721A` and `ERC2981` contracts. It allows to `mint` new tokens.

#### ERC1155

Contract that implements `ERC1155` and `ERC2981` contracts. It allows only contract owner to `mint` new tokens.

#### WizardFactory

Contract factory that deploy `ERC721A & ERC1155` contracts.

#### WizardStorage

Contract Storage that keep track of created contracts.

## Setup

Use Hardhat to develop, compile, test and deploy contracts.

```
# install dependencies
npm install
```

## Testing

```
# run test
npm test

# run coverage report from solidity-coverage
npx hardhat coverage
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

# The polygon API key used to verify contracts
POLYGONSCAN_API_KEY=
```

## Test coverage

| File              | % Stmts | % Branch | % Funcs | % Lines |
| ----------------- | ------- | -------- | ------- | ------- |
| ERC1155.sol       | 78.26   | 100      | 72.73   | 78.26   |
| ERC721A.sol       | 95.16   | 95.83    | 91.3    | 95.95   |
| WizardFactory.sol | 100     | 93.75    | 100     | 100     |
| WizardStorage.sol | 100     | 100      | 100     | 100     |
| **All files**     | 93.33   | 95.24    | 89.8    | 94.29   |

Coverage was calculated by the `solidity-coverage` plugin from hardhat.
