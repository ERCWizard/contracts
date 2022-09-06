require('@nomicfoundation/hardhat-toolbox')
require('dotenv').config()
require('hardhat-deploy')
require('hardhat-deploy-ethers')
require('./tasks')

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.7.0',
      },
      {
        version: '0.8.7',
      },
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  networks: {
    hardhat: {},
    mumbai: {
      url: process.env.MUMBAI_ALCHEMY_RPC_URL,
      chainId: 80001,
      accounts: [process.env.DEPLOY_PRIVATE_KEY],
    },
    polygon: {
      url: process.env.POLYGON_ALCHEMY_RPC_URL,
      chainId: 137,
      accounts: [process.env.DEPLOY_PRIVATE_KEY],
    },
  },
}
