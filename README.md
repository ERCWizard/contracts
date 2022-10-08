# ERCWizard contracts

ERCWizard Solidity Smart Contracts.

[Documentation](https://docs.ercwizard.com/)

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
