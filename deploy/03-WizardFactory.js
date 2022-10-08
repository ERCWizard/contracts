const { basicTierCost, premiumTierCost, advancedTierCost } = require('../arguments')
const { verify } = require('../scripts/verify')
const { networkConfig } = require('../networkConfig')

module.exports = async ({ getNamedAccounts, deployments, run, network }) => {
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  const chainId = network.config.chainId
  const localhost = chainId == 31337

  let MockV3AggregatorAddress
  if (localhost) {
    const MockV3Aggregator = await deployments.get('MockV3Aggregator')
    MockV3AggregatorAddress = MockV3Aggregator.address
  }

  const WizardFactory = await deploy('WizardFactory', {
    contract: 'WizardFactory',
    from: deployer,
    args: [
      localhost ? basicTierCost : networkConfig[chainId].basicTierCost,
      localhost ? premiumTierCost : networkConfig[chainId].premiumTierCost,
      localhost ? advancedTierCost : networkConfig[chainId].advancedTierCost,
      localhost ? MockV3AggregatorAddress : networkConfig[chainId].priceFeedAddress,
    ],
    log: true,
    waitConfirmations: localhost ? 0 : 5,
    autoMine: true,
  })

  if (!localhost) {
    await verify(run, 'contracts/WizardFactory.sol:WizardFactory', WizardFactory.address, [
      networkConfig[chainId].basicTierCost,
      networkConfig[chainId].premiumTierCost,
      networkConfig[chainId].advancedTierCost,
      networkConfig[chainId].priceFeedAddress,
    ])
  }
}

module.exports.tags = ['localhost', 'main', 'factory']
