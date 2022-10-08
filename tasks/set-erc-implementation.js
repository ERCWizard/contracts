const { contractStandard, contractTier } = require('../arguments')

task('set-erc-implementation', 'Sets a base contracts implementation in WizardFactory contract').setAction(
  async (taskArguments, hre) => {
    console.log('-- Setting Contract Implmentation --')

    const ethers = hre.ethers

    /**
     * Deployments
     */
    const ERC721A_Basic = await hre.deployments.get('ERC721A_Basic')
    const ERC721A_Premium = await hre.deployments.get('ERC721A_Premium')
    const ERC1155_Basic = await hre.deployments.get('ERC1155_Basic')
    const wizardFactory = await hre.deployments.get('WizardFactory')
    const wizardStorage = await hre.deployments.get('WizardStorage')

    /**
     * Factory Contract
     */
    const wizardFactoryContract = await ethers.getContractAt('WizardFactory', wizardFactory.address)

    /**
     * ERC-721A Implementation
     */
    const currentERC721A_BasicImplementation = await wizardFactoryContract.contractImplementation(
      contractStandard.ERC721A,
      contractTier.Basic
    )
    const currentERC721A_PremiumImplementation = await wizardFactoryContract.contractImplementation(
      contractStandard.ERC721A,
      contractTier.Premium
    )

    /**
     * ERC-1155 Implementation
     */
    const currentERC1155_BasicImplementation = await wizardFactoryContract.contractImplementation(
      contractStandard.ERC1155,
      contractTier.Basic
    )

    /**
     * Storage Implementation
     */
    const currentStorageImplementation = await wizardFactoryContract.storageImplementation()

    /**
     * Contracts Implementation
     */
    await contractImplementation(
      'ERC721A_Basic',
      wizardFactoryContract,
      currentERC721A_BasicImplementation,
      ERC721A_Basic,
      contractStandard.ERC721A,
      contractTier.Basic
    )

    await contractImplementation(
      'ERC721A_Premium',
      wizardFactoryContract,
      currentERC721A_PremiumImplementation,
      ERC721A_Premium,
      contractStandard.ERC721A,
      contractTier.Premium
    )

    await contractImplementation(
      'ERC1155_Basic',
      wizardFactoryContract,
      currentERC1155_BasicImplementation,
      ERC1155_Basic,
      contractStandard.ERC1155,
      contractTier.Basic
    )

    await contractImplementation(
      'wizardStorage',
      wizardFactoryContract,
      currentStorageImplementation,
      wizardStorage,
      0,
      0
    )
  }
)

async function contractImplementation(type, wizardFactoryContract, currentImplementation, deployments, standard, tier) {
  if (currentImplementation === deployments.address) {
    console.log(`-- ${type} already set to ${deployments.address} --`)
  } else {
    const setContractImplementationTx =
      type === 'wizardStorage'
        ? await wizardFactoryContract.setStorageImplementation(deployments.address)
        : await wizardFactoryContract.setContractImplementation(standard, tier, deployments.address)
    await setContractImplementationTx.wait()

    console.log(`-- ${type} set to ${deployments.address} --`)
  }
}
