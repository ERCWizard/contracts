const { ethers } = require('hardhat')
const { expect, assert } = require('chai')
const {
  decimals,
  initialAnswer,
  cost,
  newCost,
  mintCost,
  mintCostValue,
  merkleRoot,
  merkleProof,
} = require('../../arguments')

describe('ERC721', () => {
  let MockV3Aggregator,
    MockV3Aggregator_CF,
    ERC721,
    ERC721_CF,
    WizardFactory,
    WizardFactory_CF,
    ERC721_init,
    owner,
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
    ;[owner, user] = await ethers.getSigners()

    ERC721_init = {
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

    await WizardFactory.connect(owner).setERC721Implementation(ERC721.address)

    await WizardFactory.connect(owner).createERC721Contract(
      ...Object.values(ERC721_init),
      mintCostValue
    )
    createdContractAddress = await WizardFactory.allCreatedContracts(0)

    createdContract = await ethers.getContractAt(
      'ERC721',
      createdContractAddress
    )
  })

  describe('contructor', function () {
    it('correct name', async function () {
      expect(await createdContract.name()).to.equal(ERC721_init._name)
    })
    it('correct symbol', async function () {
      expect(await createdContract.symbol()).to.equal(ERC721_init._symbol)
    })
    it('correct cost', async function () {
      expect(await createdContract.cost()).to.equal(ERC721_init._cost)
    })
    it('correct maxSupply', async function () {
      expect(await createdContract.maxSupply()).to.equal(ERC721_init._maxSupply)
    })
    it('correct maxMintAmountPerTx', async function () {
      expect(await createdContract.maxMintAmountPerTx()).to.equal(
        ERC721_init._maxMintAmountPerTx
      )
    })
    it('correct hiddenMetadataUri', async function () {
      expect(await createdContract.hiddenMetadataUri()).to.equal(
        ERC721_init._hiddenMetadataUri
      )
    })
    it('correct uriPrefix', async function () {
      expect(await createdContract.uriPrefix()).to.equal(ERC721_init._uriPrefix)
    })
    it('correct owner', async function () {
      expect(await createdContract.owner()).to.equal(owner.address)
    })
  })

  describe('whitelistMint function', function () {
    it('setting setMerkleRoot by the owner', async function () {
      expect(await createdContract.connect(owner).setMerkleRoot(merkleRoot))
    })
    it('setting setMerkleRoot by the user, should revert', async function () {
      await expect(
        createdContract.connect(user).setMerkleRoot(merkleRoot)
      ).to.be.revertedWith('Ownable: caller is not the owner')
    })
    it('using whitelistMint function when merkleRoot is not set, should revert', async function () {
      expect(await createdContract.connect(owner).setWhitelistMintEnabled(true))

      await expect(
        createdContract
          .connect(user)
          .whitelistMint(1, merkleProof, { value: mintCost })
      ).to.be.revertedWithCustomError(createdContract, 'ERC721__InvalidProof')
    })
    it('using whitelistMint function when setWhitelistMintEnabled is false, should revert', async function () {
      expect(await createdContract.connect(owner).setMerkleRoot(merkleRoot))

      expect(await createdContract.merkleRoot()).to.equal(merkleRoot)

      await expect(
        createdContract
          .connect(user)
          .whitelistMint(1, merkleProof, { value: mintCost })
      ).to.be.revertedWithCustomError(
        createdContract,
        'ERC721__TheWhitelistSaleIsNotEnabled'
      )
    })
    it('using whitelistMint function by the whitelisted address', async function () {
      expect(await createdContract.connect(owner).setMerkleRoot(merkleRoot))
      expect(await createdContract.connect(owner).setWhitelistMintEnabled(true))

      expect(await createdContract.merkleRoot()).to.equal(merkleRoot)
      expect(await createdContract.whitelistMintEnabled()).to.equal(true)

      expect(
        await createdContract
          .connect(user)
          .whitelistMint(1, merkleProof, { value: mintCost })
      )
    })
    it('using whitelistMint function by the non whitelisted address', async function () {
      expect(await createdContract.connect(owner).setMerkleRoot(merkleRoot))
      expect(await createdContract.connect(owner).setWhitelistMintEnabled(true))

      expect(await createdContract.merkleRoot()).to.equal(merkleRoot)
      expect(await createdContract.whitelistMintEnabled()).to.equal(true)

      await expect(
        createdContract
          .connect(owner)
          .whitelistMint(1, merkleProof, { value: mintCost })
      ).to.be.revertedWithCustomError(createdContract, 'ERC721__InvalidProof')
    })
    it('using whitelistMint function by the whitelisted address twice, should revert', async function () {
      expect(await createdContract.connect(owner).setMerkleRoot(merkleRoot))
      expect(await createdContract.connect(owner).setWhitelistMintEnabled(true))

      expect(await createdContract.merkleRoot()).to.equal(merkleRoot)
      expect(await createdContract.whitelistMintEnabled()).to.equal(true)

      expect(
        await createdContract
          .connect(user)
          .whitelistMint(1, merkleProof, { value: mintCost })
      )

      await expect(
        createdContract
          .connect(user)
          .whitelistMint(1, merkleProof, { value: mintCost })
      ).to.be.revertedWithCustomError(
        createdContract,
        'ERC721__AddressAlreadyClaimed'
      )
    })
  })

  describe('mint function', function () {
    it('mint while contract is paused, should revert', async function () {
      await expect(
        createdContract.connect(user).mint(1, { value: mintCost })
      ).to.be.revertedWithCustomError(
        createdContract,
        'ERC721__TheContractIsPaused'
      )
    })
    it('correct mint', async function () {
      await createdContract.connect(owner).setPaused(false)

      expect(await createdContract.connect(user).mint(1, { value: mintCost }))
    })
    it('insufficient funds mint, should revert', async function () {
      await createdContract.connect(owner).setPaused(false)

      await expect(
        createdContract.connect(user).mint(1, { value: '10' })
      ).to.be.revertedWithCustomError(
        createdContract,
        'ERC721__InsufficientFunds'
      )
    })
    it('minting above maxMintAmountPerTx, should revert', async function () {
      await createdContract.connect(owner).setPaused(false)

      await expect(
        createdContract.connect(user).mint(4, { value: mintCost * 4 })
      ).to.be.revertedWithCustomError(
        createdContract,
        'ERC721__InvalidMintAmount'
      )
    })
    it('minting when max supply exceeded, should revert', async function () {
      await createdContract.connect(owner).setPaused(false)

      await createdContract.connect(owner).setCost('0')
      await createdContract.connect(owner).setMaxMintAmountPerTx('10000')

      await createdContract.connect(owner).mint('10000', { value: '0' })
      expect(await createdContract.maxSupply()).to.equal('10000')

      await createdContract.connect(owner).setCost(mintCost)

      await expect(
        createdContract.connect(user).mint(1, { value: mintCost })
      ).to.be.revertedWithCustomError(
        createdContract,
        'ERC721__MaxSupplyExceeded'
      )
    })
  })

  describe('mintForAddress', function () {
    it('mintForAddress function', async function () {
      await createdContract.connect(owner).mintForAddress(1, user.address)

      let userBalance

      userBalance = await createdContract.walletOfOwner(user.address)

      assert.equal(userBalance.toString(), '1')

      await expect(
        createdContract.connect(user).mintForAddress(1, owner.address)
      ).to.be.revertedWith('Ownable: caller is not the owner')

      userBalance = await createdContract.walletOfOwner(owner.address)

      assert.equal(userBalance.toString(), '')
    })
  })

  it('walletOfOwner function', async function () {
    await createdContract.connect(owner).mintForAddress(1, user.address)

    await createdContract.connect(owner).mintForAddress(1, owner.address)

    await createdContract.connect(owner).mintForAddress(3, user.address)

    const userBalance = await createdContract.walletOfOwner(user.address)

    assert.equal(userBalance.toString(), '1,3,4,5')
  })

  describe('tokenURI function', function () {
    it('show hiddenMetadataUri if revealed is false', async function () {
      await createdContract.connect(owner).mintForAddress(1, user.address)

      const tokenURI = await createdContract.tokenURI(1)

      assert.equal(tokenURI, ERC721_init._hiddenMetadataUri)
    })
    it('show currentBaseURI if revealed is true', async function () {
      await createdContract.connect(owner).setRevealed(true)
      await createdContract.connect(owner).mintForAddress(1, user.address)

      const tokenId = 1
      const uriSuffix = await createdContract.uriSuffix()
      const tokenURI = await createdContract.tokenURI(tokenId)

      assert.equal(tokenURI, ERC721_init._uriPrefix + '/' + tokenId + uriSuffix)
    })
    it('if token does not exists, should revert', async function () {
      await createdContract.connect(owner).mintForAddress(1, user.address)

      await expect(createdContract.tokenURI(2)).to.be.revertedWithCustomError(
        createdContract,
        'ERC721__URIQueryForNonexistentToken'
      )
    })
  })

  it('revealed function', async function () {
    const revealed = await createdContract.revealed()
    assert.equal(revealed, false)

    expect(await createdContract.connect(owner).setRevealed(true))

    const revealedAfter = await createdContract.revealed()
    assert.equal(revealedAfter, true)

    await expect(
      createdContract.connect(user).setRevealed(true)
    ).to.be.revertedWith('Ownable: caller is not the owner')
  })

  it('setCost function', async function () {
    const contractCost = await createdContract.cost()
    assert.equal(contractCost, ERC721_init._cost)

    expect(await createdContract.connect(owner).setCost(newCost))

    const contractCostAfter = await createdContract.cost()
    assert.equal(contractCostAfter, newCost)

    await expect(createdContract.connect(user).setCost('3')).to.be.revertedWith(
      'Ownable: caller is not the owner'
    )
  })

  describe('initialize function', function () {
    it('try initialize deployed contract', async function () {
      await expect(
        createdContract
          .connect(owner)
          .initialize(...Object.values(ERC721_init), owner.address)
      ).to.be.revertedWith('Initializable: contract is already initialized')
    })
  })

  it('withdraw function', async function () {
    await createdContract.connect(owner).setPaused(false)

    await createdContract.connect(user).mint('1', { value: mintCost })

    let Balance, BalanceAfter

    Balance = await ethers.provider.getBalance(createdContract.address)

    expect(await createdContract.connect(owner).withdraw())

    BalanceAfter = await ethers.provider.getBalance(createdContract.address)

    assert.notEqual(Balance.toString(), BalanceAfter.toString())

    // user
    await createdContract.connect(user).mint('1', { value: mintCost })

    Balance = await ethers.provider.getBalance(createdContract.address)

    await expect(createdContract.connect(user).withdraw()).to.be.revertedWith(
      'Ownable: caller is not the owner'
    )

    BalanceAfter = await ethers.provider.getBalance(createdContract.address)

    assert.equal(Balance.toString(), BalanceAfter.toString())
  })
})
