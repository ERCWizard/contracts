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

| File                | % Stmts | % Branch | % Funcs | % Lines |
| ------------------- | ------- | -------- | ------- | ------- |
| ERC1155_Basic.sol   | 79.17   | 100      | 72.73   | 79.17   |
| ERC721A_Basic.sol   | 94.34   | 94.44    | 90      | 95.16   |
| ERC721A_Premium.sol | 100     | 100      | 100     | 100     |
| WizardFactory.sol   | 100     | 90       | 100     | 100     |
| WizardStorage.sol   | 100     | 100      | 100     | 100     |
| All files           | 93.1    | 94.44    | 89.8    | 94.03   |

Coverage was calculated by the `solidity-coverage` plugin from hardhat.
