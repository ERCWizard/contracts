const { verify } = require('../scripts/verify')

module.exports = async ({ getNamedAccounts, deployments, run, network }) => {
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  const localhost = network.config.chainId == 31337

  const ERC721 = await deploy('ERC721', {
    contract: 'ERC721',
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 5,
  })

  if (!localhost) {
    await verify(run, 'contracts/WizardERC721.sol:ERC721', ERC721.address, [])
  }
}

module.exports.tags = ['localhost', 'main']
