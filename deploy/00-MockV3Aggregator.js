const { decimals, initialAnswer } = require('../arguments')

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  await deploy('MockV3Aggregator', {
    contract: 'MockV3Aggregator',
    from: deployer,
    args: [decimals, initialAnswer],
    log: true,
    autoMine: true,
  })
}
module.exports.tags = ['localhost', 'mock']
