const { verify } = require('../scripts/verify')

module.exports = async ({ getNamedAccounts, deployments, run, network }) => {
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  const localhost = network.config.chainId == 31337

  const ERC1155 = await deploy('ERC1155', {
    contract: 'ERC1155',
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 5,
  })

  if (!localhost) {
    await verify(
      run,
      'contracts/WizardERC1155.sol:ERC1155',
      ERC1155.address,
      []
    )
  }
}

module.exports.tags = ['localhost', 'main']
