task(
  'set-erc-implementation',
  'Sets a base ERC implementation in WizardFactory contract'
).setAction(async (taskArguments, hre) => {
  console.log('-- Setting ERC implmentation --')

  const ethers = hre.ethers
  const ERC721 = await hre.deployments.get('ERC721')
  const ERC1155 = await hre.deployments.get('ERC1155')
  const wizardFactory = await hre.deployments.get('WizardFactory')
  const wizardFactoryContract = await ethers.getContractAt(
    'WizardFactory',
    wizardFactory.address
  )
  const currentERC721Implementation =
    await wizardFactoryContract.ERC721Implementation()
  const currentERC1155Implementation =
    await wizardFactoryContract.ERC1155Implementation()

  if (currentERC721Implementation === ERC721.address) {
    console.log(`-- ERC721 implmentation already set to ${ERC721.address} --`)
  } else {
    const setERC721ImplementationTx =
      await wizardFactoryContract.setERC721Implementation(ERC721.address ?? '')
    await setERC721ImplementationTx.wait()
    console.log(`-- ERC721 implmentation set to ${ERC721.address} --`)
  }

  if (currentERC1155Implementation === ERC1155.address) {
    console.log(`-- ERC1155 implmentation already set to ${ERC1155.address} --`)
  } else {
    const setERC1155ImplementationTx =
      await wizardFactoryContract.setERC1155Implementation(
        ERC1155.address ?? ''
      )
    await setERC1155ImplementationTx.wait()
    console.log(`-- ERC1155 implmentation set to ${ERC1155.address} --`)
  }
})
