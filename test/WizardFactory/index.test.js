const { ethers } = require('hardhat')
const { expect, assert } = require('chai')
const {
  decimals,
  initialAnswer,
  cost,
  newCost,
  mintCostValue,
} = require('../../arguments')

describe('WizardFactory', () => {
  let MockV3Aggregator,
    MockV3Aggregator_CF,
    ERC721,
    ERC721_CF,
    ERC1155,
    ERC1155_CF,
    WizardFactory,
    WizardFactory_CF,
    ERC721_init,
    ERC1155_init,
    dev,
    user

  beforeEach(async () => {
    MockV3Aggregator_CF = await ethers.getContractFactory('MockV3Aggregator')
    MockV3Aggregator = await MockV3Aggregator_CF.deploy(decimals, initialAnswer)
    await MockV3Aggregator.deployed()

    ERC721_CF = await ethers.getContractFactory('ERC721')
    ERC721 = await ERC721_CF.deploy()
    await ERC721.deployed()

    ERC1155_CF = await ethers.getContractFactory('ERC1155')
    ERC1155 = await ERC1155_CF.deploy()
    await ERC1155.deployed()

    WizardFactory_CF = await ethers.getContractFactory('WizardFactory')
    WizardFactory = await WizardFactory_CF.deploy(
      cost,
      MockV3Aggregator.address
    )
    await WizardFactory.deployed()
    ;[dev, user] = await ethers.getSigners()

    ERC721_init = {
      _name: 'Test',
      _symbol: 'TEST',
      _cost: '1',
      _maxSupply: '10000',
      _maxMintAmountPerTx: '3',
      _hiddenMetadataUri: 'hiddenMetadataUriTest',
      _uriPrefix: 'uriPrefixTest',
      _royaltyReceiver: dev.address,
      _feePercent: '500',
    }

    ERC1155_init = {
      _name: 'Test',
      _symbol: 'TEST',
      _id: '1',
      _amount: '100',
      _uri: 'uriTest',
      _royaltyReceiver: dev.address,
      _feePercent: '500',
    }
  })

  describe('createContract', () => {
    it('should revert when ERCImplementation is a null address', async () => {
      await expect(
        WizardFactory.connect(dev).createERC721Contract(
          ...Object.values(ERC721_init),
          mintCostValue
        )
      ).to.be.reverted

      await expect(
        WizardFactory.connect(dev).createERC1155Contract(
          ...Object.values(ERC1155_init),
          mintCostValue
        )
      ).to.be.reverted
    })

    it('should add the address of created Contract to allCreatedContracts array', async () => {
      await WizardFactory.connect(dev).setERC721Implementation(ERC721.address)
      await expect(WizardFactory.allCreatedContracts(0)).to.be.reverted

      await WizardFactory.connect(dev).setERC1155Implementation(ERC1155.address)
      await expect(WizardFactory.allCreatedContracts(0)).to.be.reverted

      await WizardFactory.connect(user).createERC721Contract(
        ...Object.values(ERC721_init),
        mintCostValue
      )
      const createdContractAddress0 = await WizardFactory.allCreatedContracts(0)

      await WizardFactory.connect(user).createERC1155Contract(
        ...Object.values(ERC1155_init),
        mintCostValue
      )
      const createdContractAddress1 = await WizardFactory.allCreatedContracts(1)

      expect(createdContractAddress0).to.not.equal(ethers.constants.AddressZero)
      expect(createdContractAddress0).to.not.equal(undefined)

      expect(createdContractAddress1).to.not.equal(ethers.constants.AddressZero)
      expect(createdContractAddress1).to.not.equal(undefined)
    })

    it("should add the address of created Contract to array of created Contracts by the message's sender", async () => {
      await WizardFactory.connect(dev).setERC721Implementation(ERC721.address)
      await WizardFactory.connect(dev).setERC1155Implementation(ERC1155.address)

      await WizardFactory.connect(dev).createERC721Contract(
        ...Object.values(ERC721_init),
        mintCostValue
      )
      await WizardFactory.connect(user).createERC721Contract(
        ...Object.values(ERC721_init),
        mintCostValue
      )
      await WizardFactory.connect(user).createERC1155Contract(
        ...Object.values(ERC1155_init),
        mintCostValue
      )

      const devCreatedContracts = await WizardFactory.getCreatedContracts(
        dev.address
      )
      const userCreatedContracts = await WizardFactory.getCreatedContracts(
        user.address
      )

      expect(devCreatedContracts.map((addr) => addr._address).length).to.equal(
        1
      )
      expect(userCreatedContracts.map((addr) => addr._address).length).to.equal(
        2
      )
    })

    it("should transfer the ownership of the contract to the message's sender", async () => {
      await WizardFactory.connect(dev).setERC721Implementation(ERC721.address)
      await WizardFactory.connect(dev).setERC1155Implementation(ERC1155.address)

      await WizardFactory.connect(dev).createERC721Contract(
        ...Object.values(ERC721_init),
        mintCostValue
      )
      await WizardFactory.connect(dev).createERC1155Contract(
        ...Object.values(ERC1155_init),
        mintCostValue
      )

      const createdERC721ContractAddress =
        await WizardFactory.allCreatedContracts(0)
      const createdERC721Contract = await ethers.getContractAt(
        'ERC721',
        createdERC721ContractAddress
      )

      const createdERC1155ContractAddress =
        await WizardFactory.allCreatedContracts(1)
      const createdERC1155Contract = await ethers.getContractAt(
        'ERC1155',
        createdERC1155ContractAddress
      )

      expect(await createdERC721Contract.owner()).to.equal(dev.address)
      expect(await createdERC1155Contract.owner()).to.equal(dev.address)
    })

    it('should emit `ERC721ContractCreated` event when ERC721Contract is created', async () => {
      await WizardFactory.connect(dev).setERC721Implementation(ERC721.address)

      await expect(
        WizardFactory.connect(user).createERC721Contract(
          ...Object.values(ERC721_init),
          mintCostValue
        )
      ).to.emit(WizardFactory, 'ERC721ContractCreated')
    })

    it('should emit `ERC1155ContractCreated` event when ERC1155Contract is created', async () => {
      await WizardFactory.connect(dev).setERC1155Implementation(ERC1155.address)

      await expect(
        WizardFactory.connect(user).createERC1155Contract(
          ...Object.values(ERC1155_init),
          mintCostValue
        )
      ).to.emit(WizardFactory, 'ERC1155ContractCreated')
    })
  })

  describe('setERCImplementation', () => {
    it('should revert when ERCImplementation is set to a null address', async () => {
      await expect(
        WizardFactory.connect(dev).setERC721Implementation(
          ethers.constants.AddressZero
        )
      ).to.be.reverted

      await expect(
        WizardFactory.connect(dev).setERC1155Implementation(
          ethers.constants.AddressZero
        )
      ).to.be.reverted
    })

    it('should revert when setERCImplementation is called by an address other than the owner', async () => {
      await expect(
        WizardFactory.connect(user).setERC721Implementation(ERC721.address)
      ).to.be.reverted

      await expect(
        WizardFactory.connect(user).setERC1155Implementation(ERC1155.address)
      ).to.be.reverted
    })

    it('should set setERCImplementation to the address passed to function', async () => {
      await WizardFactory.connect(dev).setERC721Implementation(ERC721.address)

      expect(await WizardFactory.ERC721Implementation()).to.equal(
        ERC721.address
      )

      await WizardFactory.connect(dev).setERC1155Implementation(ERC1155.address)

      expect(await WizardFactory.ERC1155Implementation()).to.equal(
        ERC1155.address
      )
    })

    it('should emit `SetERCImplementation` when ERCImplementation is set', async () => {
      await expect(
        WizardFactory.connect(dev).setERC721Implementation(ERC721.address)
      )
        .to.emit(WizardFactory, 'SetERCImplementation')
        .withArgs(ERC721.address)

      await expect(
        WizardFactory.connect(dev).setERC1155Implementation(ERC1155.address)
      )
        .to.emit(WizardFactory, 'SetERCImplementation')
        .withArgs(ERC1155.address)
    })
  })

  describe('set functions', () => {
    it('setPriceFeed function sets the aggregator address correctly', async function () {
      await WizardFactory.connect(dev).setPriceFeed(dev.address)
      const priceFeedAddress = await WizardFactory.priceFeed()
      expect(priceFeedAddress).to.equal(dev.address)
    })

    it('set cost', async function () {
      expect(await WizardFactory.cost()).to.equal(cost)

      await WizardFactory.connect(dev).setCost(newCost)

      expect(await WizardFactory.cost()).to.equal(newCost)

      await expect(
        WizardFactory.connect(user).setCost(newCost)
      ).to.be.revertedWith('Ownable: caller is not the owner')
    })
  })

  describe('view functions', () => {
    it('correct cost value ', async function () {
      expect(await WizardFactory.cost()).to.equal(cost)
    })

    it('correct priceFeed address ', async function () {
      expect(await WizardFactory.priceFeed()).to.equal(MockV3Aggregator.address)
    })

    it('latest price converted from 8 to 18 decimals', async function () {
      expect((await WizardFactory.getLatestPrice()).toString()).to.equal(
        (initialAnswer * 1e10).toString()
      )
    })

    it('correct token amount', async function () {
      expect(await WizardFactory.getCost()).to.equal(cost)
    })

    it('getTotalCreatedContracts', async function () {
      await WizardFactory.connect(dev).setERC721Implementation(ERC721.address)
      await WizardFactory.connect(user).createERC721Contract(
        ...Object.values(ERC721_init),
        mintCostValue
      )
      await WizardFactory.connect(user).createERC721Contract(
        ...Object.values(ERC721_init),
        mintCostValue
      )
      expect(await WizardFactory.getTotalCreatedContracts()).to.equal(2)
    })
  })

  describe('withdraw function', () => {
    it('withdraw by the owner', async function () {
      await WizardFactory.connect(dev).setERC721Implementation(ERC721.address)

      await WizardFactory.connect(user).createERC721Contract(
        ...Object.values(ERC721_init),
        mintCostValue
      )

      const WizardFactoryBalance = await ethers.provider.getBalance(
        WizardFactory.address
      )

      expect(await WizardFactory.connect(dev).withdraw())

      const WizardFactoryBalanceAfter = await ethers.provider.getBalance(
        WizardFactory.address
      )

      assert.notEqual(
        WizardFactoryBalance.toString(),
        WizardFactoryBalanceAfter.toString()
      )
    })

    it('withdraw by the user, should revert', async function () {
      await WizardFactory.connect(dev).setERC721Implementation(ERC721.address)

      await WizardFactory.connect(user).createERC721Contract(
        ...Object.values(ERC721_init),
        mintCostValue
      )

      const WizardFactoryBalance = await ethers.provider.getBalance(
        WizardFactory.address
      )

      await expect(WizardFactory.connect(user).withdraw()).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )

      const WizardFactoryBalanceAfter = await ethers.provider.getBalance(
        WizardFactory.address
      )

      assert.equal(
        WizardFactoryBalance.toString(),
        WizardFactoryBalanceAfter.toString()
      )
    })
  })
})
