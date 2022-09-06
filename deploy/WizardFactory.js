const { cost } = require('../arguments')

module.exports = async ({ getNamedAccounts, deployments, run }) => {
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  const MockV3Aggregator = await deployments.get('MockV3Aggregator')
  const MockV3AggregatorAddress = MockV3Aggregator.address

  await deploy('WizardFactory', {
    contract: 'WizardFactory',
    from: deployer,
    args: [cost, MockV3AggregatorAddress],
    log: true,
  })
  await run('set-erc-implementation')
}

module.exports.tags = ['localhost', 'main']
