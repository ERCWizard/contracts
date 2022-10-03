task('set-erc-implementation', 'Sets a base ERC implementation in WizardFactory contract').setAction(
  async (taskArguments, hre) => {
    console.log('-- Setting ERC implmentation --')

    const ethers = hre.ethers

    const ERC721A = await hre.deployments.get('ERC721A')
    const ERC1155 = await hre.deployments.get('ERC1155')

    const wizardFactory = await hre.deployments.get('WizardFactory')
    const wizardStorage = await hre.deployments.get('WizardStorage')

    const wizardFactoryContract = await ethers.getContractAt('WizardFactory', wizardFactory.address)

    const currentWizardStorageImplementation = await wizardFactoryContract.WizardStorageImplementation()

    const currentERC721AImplementation = await wizardFactoryContract.ERC721AImplementation()
    const currentERC1155Implementation = await wizardFactoryContract.ERC1155Implementation()

    if (currentERC721AImplementation === ERC721A.address) {
      console.log(`-- ERC721A implmentation already set to ${ERC721A.address} --`)
    } else {
      const setERC721AImplementationTx = await wizardFactoryContract.setERC721AImplementation(ERC721A.address ?? '')
      await setERC721AImplementationTx.wait()
      console.log(`-- ERC721A implmentation set to ${ERC721A.address} --`)
    }

    if (currentERC1155Implementation === ERC1155.address) {
      console.log(`-- ERC1155 implmentation already set to ${ERC1155.address} --`)
    } else {
      const setERC1155ImplementationTx = await wizardFactoryContract.setERC1155Implementation(ERC1155.address ?? '')
      await setERC1155ImplementationTx.wait()
      console.log(`-- ERC1155 implmentation set to ${ERC1155.address} --`)
    }

    if (currentWizardStorageImplementation === wizardStorage.address) {
      console.log(`-- WizardStorage implmentation already set to ${wizardStorage.address} --`)
    } else {
      const setWizardStorageImplementationTx = await wizardFactoryContract.setWizardStorageImplementation(
        wizardStorage.address ?? ''
      )
      await setWizardStorageImplementationTx.wait()
      console.log(`-- WizardStorage implmentation set to ${wizardStorage.address} --`)
    }
  }
)
