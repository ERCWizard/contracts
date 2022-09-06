module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  await deploy('ERC721', {
    contract: 'ERC721',
    from: deployer,
    args: [],
    log: true,
  })
}

module.exports.tags = ['localhost', 'main']
