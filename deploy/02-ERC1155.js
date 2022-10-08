const { verify } = require('../scripts/verify')

module.exports = async ({ getNamedAccounts, deployments, run, network }) => {
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  const localhost = network.config.chainId == 31337

  const ERC1155_Basic = await deploy('ERC1155_Basic', {
    contract: 'ERC1155_Basic',
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: localhost ? 0 : 5,
    autoMine: true,
  })

  if (!localhost) {
    await verify(run, 'contracts/ERC1155/ERC1155_Basic.sol:ERC1155_Basic', ERC1155_Basic.address, [])
  }
}

module.exports.tags = ['localhost', 'main']
