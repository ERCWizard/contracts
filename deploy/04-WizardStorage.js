const { verify } = require('../scripts/verify')

module.exports = async ({ getNamedAccounts, deployments, run, network }) => {
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  const localhost = network.config.chainId == 31337

  const WizardFactory = await deployments.get('WizardFactory')
  const WizardFactoryAddress = WizardFactory.address

  const WizardStorage = await deploy('WizardStorage', {
    contract: 'WizardStorage',
    from: deployer,
    args: [WizardFactoryAddress],
    log: true,
    waitConfirmations: localhost ? 0 : 5,
    autoMine: true,
  })

  if (!localhost) {
    await verify(run, 'contracts/WizardStorage.sol:WizardStorage', WizardStorage.address, [WizardFactoryAddress])
  }
  await run('set-erc-implementation')
}

module.exports.tags = ['localhost', 'main']
