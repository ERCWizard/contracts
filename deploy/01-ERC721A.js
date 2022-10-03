const { verify } = require('../scripts/verify')

module.exports = async ({ getNamedAccounts, deployments, run, network }) => {
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  const localhost = network.config.chainId == 31337

  const ERC721A = await deploy('ERC721A', {
    contract: 'ERC721A',
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 5,
    autoMine: true,
  })

  if (!localhost) {
    await verify(run, 'contracts/ERC721A.sol:ERC721A', ERC721A.address, [])
  }
}

module.exports.tags = ['localhost', 'main']
