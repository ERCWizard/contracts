const { verify } = require('../scripts/verify')

module.exports = async ({ getNamedAccounts, deployments, run, network }) => {
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  const localhost = network.config.chainId == 31337

  const ERC721A_Basic = await deploy('ERC721A_Basic', {
    contract: 'ERC721A_Basic',
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: localhost ? 0 : 5,
    autoMine: true,
  })

  const ERC721A_Premium = await deploy('ERC721A_Premium', {
    contract: 'ERC721A_Premium',
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: localhost ? 0 : 5,
    autoMine: true,
  })

  if (!localhost) {
    await verify(run, 'contracts/ERC721A/ERC721A_Basic.sol:ERC721A_Basic', ERC721A_Basic.address, [])

    await verify(run, 'contracts/ERC721A/ERC721A_Premium.sol:ERC721A_Premium', ERC721A_Premium.address, [])
  }
}

module.exports.tags = ['localhost', 'main']
