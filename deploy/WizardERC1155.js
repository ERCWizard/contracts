module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  await deploy('ERC1155', {
    contract: 'ERC1155',
    from: deployer,
    args: [],
    log: true,
  })
}

module.exports.tags = ['localhost', 'main']
