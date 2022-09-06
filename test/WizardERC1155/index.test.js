const { ethers } = require('hardhat')
const { expect, assert } = require('chai')
const {
  decimals,
  initialAnswer,
  cost,
  mintCostValue,
} = require('../../arguments')

describe('ERC1155', () => {
  let MockV3Aggregator,
    MockV3Aggregator_CF,
    ERC1155,
    ERC1155_CF,
    WizardFactory,
    WizardFactory_CF,
    ERC1155_init,
    owner,
    user,
    createdContract,
    createdContractAddress

  beforeEach(async () => {
    MockV3Aggregator_CF = await ethers.getContractFactory('MockV3Aggregator')
    MockV3Aggregator = await MockV3Aggregator_CF.deploy(decimals, initialAnswer)
    await MockV3Aggregator.deployed()

    ERC1155_CF = await ethers.getContractFactory('ERC1155')
    ERC1155 = await ERC1155_CF.deploy()
    await ERC1155.deployed()

    WizardFactory_CF = await ethers.getContractFactory('WizardFactory')
    WizardFactory = await WizardFactory_CF.deploy(
      cost,
      MockV3Aggregator.address
    )
    await WizardFactory.deployed()
    ;[owner, user] = await ethers.getSigners()

    ERC1155_init = {
      _name: 'Test',
      _symbol: 'TEST',
      _id: '1',
      _amount: '100',
      _uri: 'uriTest',
      _royaltyReceiver: owner.address,
      _feePercent: '500',
    }

    await WizardFactory.connect(owner).setERC1155Implementation(ERC1155.address)

    await WizardFactory.connect(owner).createERC1155Contract(
      ...Object.values(ERC1155_init),
      mintCostValue
    )
    createdContractAddress = await WizardFactory.allCreatedContracts(0)

    createdContract = await ethers.getContractAt(
      'ERC1155',
      createdContractAddress
    )
  })

  describe('contructor', function () {
    it('correct name', async function () {
      expect(await createdContract.name()).to.equal(ERC1155_init._name)
    })
    it('correct symbol', async function () {
      expect(await createdContract.symbol()).to.equal(ERC1155_init._symbol)
    })
    it('correct tokenURI', async function () {
      expect(await createdContract.tokenURI(ERC1155_init._id)).to.equal(
        ERC1155_init._uri
      )
    })
    it('correct balance', async function () {
      expect(
        await createdContract.balanceOf(owner.address, ERC1155_init._id)
      ).to.equal(100)
    })
    it('correct owner', async function () {
      expect(await createdContract.owner()).to.equal(owner.address)
    })
  })

  describe('mint', function () {
    it('mint function', async function () {
      expect(await createdContract.connect(owner).mint(owner.address, 1, 100))

      await expect(
        createdContract.connect(user).mint(user.address, 1, 100)
      ).to.be.revertedWith('Ownable: caller is not the owner')
    })
    it('mintBatch function', async function () {
      expect(
        await createdContract
          .connect(owner)
          .mintBatch(owner.address, [1, 2, 3], [100, 100, 100])
      )

      await expect(
        createdContract
          .connect(user)
          .mintBatch(user.address, [1, 2, 3], [100, 100, 100])
      ).to.be.revertedWith('Ownable: caller is not the owner')
    })
  })

  describe('burn', function () {
    it('burn function', async function () {
      await createdContract.connect(owner).mint(owner.address, 1, 100)

      expect(await createdContract.connect(owner).burn(1, 100))

      await createdContract.connect(owner).mint(owner.address, 1, 100)

      await expect(
        createdContract.connect(user).burn(1, 50)
      ).to.be.revertedWith('ERC1155: burn amount exceeds balance')

      await createdContract.connect(owner).mint(owner.address, 2, 100)

      await expect(
        createdContract.connect(owner).burn(2, 101)
      ).to.be.revertedWith('ERC1155: burn amount exceeds balance')
    })

    it('burnBatch function', async function () {
      await createdContract
        .connect(owner)
        .mintBatch(owner.address, [1, 2, 3], [100, 100, 100])

      expect(
        await createdContract
          .connect(owner)
          .burnBatch([1, 2, 3], [100, 100, 100])
      )

      await createdContract
        .connect(owner)
        .mintBatch(owner.address, [1, 2, 3], [100, 100, 100])

      await expect(
        createdContract.connect(user).burnBatch([1, 2, 3], [100, 100, 100])
      ).to.be.revertedWith('ERC1155: burn amount exceeds balance')

      await createdContract
        .connect(owner)
        .mintBatch(owner.address, [4, 5, 6], [100, 100, 100])

      await expect(
        createdContract.connect(owner).burnBatch([4, 5, 6], [100, 101, 200])
      ).to.be.revertedWith('ERC1155: burn amount exceeds balance')
    })
  })

  describe('setURI & uri function', function () {
    const uri = 'ipfs://image_metadata_uri'

    it('setURI function', async function () {
      expect(await createdContract.connect(owner).setURI(1, uri))

      let tokenURI, uriFunction

      tokenURI = await createdContract.tokenURI(1)
      assert.equal(tokenURI, uri)

      uriFunction = await createdContract.uri(1)
      assert.equal(uriFunction, uri)

      // user
      await expect(
        createdContract.connect(user).setURI(2, uri)
      ).to.be.revertedWith('Ownable: caller is not the owner')

      tokenURI = await createdContract.tokenURI(2)
      assert.equal(tokenURI, '')

      uriFunction = await createdContract.uri(2)
      assert.equal(uriFunction, '')

      // token does not exists
      const res = await createdContract.uri(1)

      tokenURI = await createdContract.tokenURI(1)
      assert.equal(tokenURI, res)

      uriFunction = await createdContract.uri(1)
      assert.equal(uriFunction, res)
    })
  })

  describe('initialize function', function () {
    it('try initialize deployed contract', async function () {
      await expect(
        createdContract
          .connect(owner)
          .initialize(...Object.values(ERC1155_init), owner.address)
      ).to.be.revertedWith('Initializable: contract is already initialized')
    })
  })
})
