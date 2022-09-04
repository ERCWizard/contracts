require('@nomicfoundation/hardhat-toolbox')
require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.7',
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
