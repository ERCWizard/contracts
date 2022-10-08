const { ethers } = require('hardhat')
const { expect, assert } = require('chai')
const {
  decimals,
  initialAnswer,
  basicTierCost,
  premiumTierCost,
  advancedTierCost,
  mintCost,
  merkleRoot,
  merkleProof,
  contractStandard,
  contractTier,
} = require('../../arguments')

describe('ERC721A_Premium', () => {
  let MockV3Aggregator,
    MockV3Aggregator_CF,
    ERC721A,
    ERC721A_CF,
    WizardFactory,
    WizardFactory_CF,
    WizardStorage,
    WizardStorage_CF,
    ERC721A_init,
    owner,
    user

  beforeEach(async () => {
    MockV3Aggregator_CF = await ethers.getContractFactory('MockV3Aggregator')
    MockV3Aggregator = await MockV3Aggregator_CF.deploy(decimals, initialAnswer)
    await MockV3Aggregator.deployed()

    ERC721A_CF = await ethers.getContractFactory('ERC721A_Premium')
    ERC721A = await ERC721A_CF.deploy()
    await ERC721A.deployed()

    WizardFactory_CF = await ethers.getContractFactory('WizardFactory')
    WizardFactory = await WizardFactory_CF.deploy(
      basicTierCost,
      premiumTierCost,
      advancedTierCost,
      MockV3Aggregator.address
    )
    await WizardFactory.deployed()

    WizardStorage_CF = await ethers.getContractFactory('WizardStorage')
    WizardStorage = await WizardStorage_CF.deploy(WizardFactory.address)
    await WizardStorage.deployed()
    ;[owner, user] = await ethers.getSigners()

    ERC721A_init = {
      _name: 'Test',
      _symbol: 'TEST',
      _cost: mintCost,
      _maxSupply: '10000',
      _maxMintAmountPerTx: '3',
      _hiddenMetadataUri: 'hiddenMetadataUriTest',
      _uriPrefix: 'uriPrefixTest',
      _royaltyReceiver: owner.address,
      _feePercent: '500',
    }

    await WizardFactory.connect(owner).setStorageImplementation(WizardStorage.address)

    await WizardFactory.connect(owner).setContractImplementation(
      contractStandard.ERC721A,
      contractTier.Premium,
      ERC721A.address
    )

    await WizardFactory.connect(owner).createERC721AContract(...Object.values(ERC721A_init), contractTier.Premium, {
      value: premiumTierCost,
    })

    createdContractAddress = await WizardStorage.getCreatedContracts(owner.address)

    createdContract = await ethers.getContractAt('ERC721A_Premium', createdContractAddress[0][2])
  })

  describe('whitelistMint function', function () {
    it('setting setMerkleRoot by the owner', async function () {
      expect(await createdContract.connect(owner).setMerkleRoot(merkleRoot))
    })
    it('setting setMerkleRoot by the user, should revert', async function () {
      await expect(createdContract.connect(user).setMerkleRoot(merkleRoot)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })
    it('using whitelistMint function when merkleRoot is not set, should revert', async function () {
      expect(await createdContract.connect(owner).setWhitelistMintEnabled(true))

      await expect(
        createdContract.connect(user).whitelistMint(1, merkleProof, { value: mintCost })
      ).to.be.revertedWithCustomError(createdContract, 'InvalidProof')
    })
    it('using whitelistMint function when setWhitelistMintEnabled is false, should revert', async function () {
      expect(await createdContract.connect(owner).setMerkleRoot(merkleRoot))

      expect(await createdContract.merkleRoot()).to.equal(merkleRoot)

      await expect(
        createdContract.connect(user).whitelistMint(1, merkleProof, { value: mintCost })
      ).to.be.revertedWithCustomError(createdContract, 'TheWhitelistSaleIsNotEnabled')
    })
    it('using whitelistMint function by the whitelisted address', async function () {
      expect(await createdContract.connect(owner).setMerkleRoot(merkleRoot))
      expect(await createdContract.connect(owner).setWhitelistMintEnabled(true))

      expect(await createdContract.merkleRoot()).to.equal(merkleRoot)
      expect(await createdContract.whitelistMintEnabled()).to.equal(true)

      expect(await createdContract.connect(user).whitelistMint(1, merkleProof, { value: mintCost }))
    })
    it('using whitelistMint function by the non whitelisted address', async function () {
      expect(await createdContract.connect(owner).setMerkleRoot(merkleRoot))
      expect(await createdContract.connect(owner).setWhitelistMintEnabled(true))

      expect(await createdContract.merkleRoot()).to.equal(merkleRoot)
      expect(await createdContract.whitelistMintEnabled()).to.equal(true)

      await expect(
        createdContract.connect(owner).whitelistMint(1, merkleProof, { value: mintCost })
      ).to.be.revertedWithCustomError(createdContract, 'InvalidProof')
    })
    it('using whitelistMint function by the whitelisted address twice, should revert', async function () {
      expect(await createdContract.connect(owner).setMerkleRoot(merkleRoot))
      expect(await createdContract.connect(owner).setWhitelistMintEnabled(true))

      expect(await createdContract.merkleRoot()).to.equal(merkleRoot)
      expect(await createdContract.whitelistMintEnabled()).to.equal(true)

      expect(await createdContract.connect(user).whitelistMint(1, merkleProof, { value: mintCost }))

      await expect(
        createdContract.connect(user).whitelistMint(1, merkleProof, { value: mintCost })
      ).to.be.revertedWithCustomError(createdContract, 'AddressAlreadyClaimed')
    })
  })

  describe('initialize function', function () {
    it('try initialize deployed contract', async function () {
      await expect(
        createdContract.connect(owner).initialize(...Object.values(ERC721A_init), owner.address)
      ).to.be.revertedWith('Initializable: contract is already initialized')
    })
  })
})
