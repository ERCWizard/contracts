const { ethers } = require('hardhat')
const { expect } = require('chai')
const { decimals, initialAnswer, cost } = require('../../arguments')

describe('WizardStorage', () => {
  let MockV3Aggregator, MockV3Aggregator_CF, WizardFactory, WizardFactory_CF, WizardStorage, WizardStorage_CF, dev, user

  beforeEach(async () => {
    MockV3Aggregator_CF = await ethers.getContractFactory('MockV3Aggregator')
    MockV3Aggregator = await MockV3Aggregator_CF.deploy(decimals, initialAnswer)
    await MockV3Aggregator.deployed()

    WizardFactory_CF = await ethers.getContractFactory('WizardFactory')
    WizardFactory = await WizardFactory_CF.deploy(cost, MockV3Aggregator.address)
    await WizardFactory.deployed()

    WizardStorage_CF = await ethers.getContractFactory('WizardStorage')
    WizardStorage = await WizardStorage_CF.deploy(WizardFactory.address)
    await WizardStorage.deployed()
    ;[dev, user] = await ethers.getSigners()

    await WizardFactory.connect(dev).setWizardStorageImplementation(WizardStorage.address)
  })

  describe('createContract', () => {
    it('should revert when addCreatedContract is not called by the factory', async () => {
      await expect(
        WizardStorage.connect(user).addCreatedContract(user.address, 0, user.address)
      ).to.be.revertedWithCustomError(WizardStorage, 'CallerIsNotTheFactory')
    })
  })

  describe('setFactoryAddress', () => {
    it('set new factory address', async () => {
      const factoryAddress = await WizardStorage.factory()

      expect(factoryAddress).to.equal(WizardFactory.address)

      await WizardStorage.connect(dev).setFactoryAddress(dev.address)

      const newFactoryAddress = await WizardStorage.factory()

      expect(newFactoryAddress).to.equal(dev.address)
    })
    it('set new factory address by user, should revert', async () => {
      const factoryAddress = await WizardStorage.factory()

      expect(factoryAddress).to.equal(WizardFactory.address)

      await expect(WizardStorage.connect(user).setFactoryAddress(user.address)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )

      const newFactoryAddress = await WizardStorage.factory()

      expect(newFactoryAddress).to.equal(WizardFactory.address)
    })
  })
})
