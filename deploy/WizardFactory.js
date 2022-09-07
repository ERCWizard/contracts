const { cost } = require('../arguments')
const { verify } = require('../scripts/verify')

module.exports = async ({ getNamedAccounts, deployments, run, network }) => {
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  const localhost = network.config.chainId == 31337

  const MockV3Aggregator = await deployments.get('MockV3Aggregator')
  const MockV3AggregatorAddress = MockV3Aggregator.address

  const WizardFactory = await deploy('WizardFactory', {
    contract: 'WizardFactory',
    from: deployer,
    args: [cost, MockV3AggregatorAddress],
    log: true,
  })

  if (!localhost) {
    await verify(
      run,
      'contracts/WizardFactory.sol:WizardFactory',
      WizardFactory.address,
      []
    )
  }
  await run('set-erc-implementation')
}

module.exports.tags = ['localhost', 'main']
