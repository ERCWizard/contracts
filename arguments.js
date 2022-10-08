const decimals = 8
const initialAnswer = 100000000
const cost = '10000000000000000000'
const basicTierCost = '20000000000000000000'
const premiumTierCost = '30000000000000000000'
const advancedTierCost = '40000000000000000000'
const insufficient = '1000000000000000000'
const newCost = '20000000000000000000'
const mintCost = '11'
const mintCostValue = { value: basicTierCost }
const falseMintCostValue = { value: insufficient }
const merkleRoot = '0xf94888b18e06ff7436a3d934ebeb2ad9e8a4eca64215758d2eed3415fc565ff0'
const merkleProof = ['0x09475e4e2909eb21dd8c353acb89220aa0d9be393112dc4b540bb9486c8b6421']

const contractStandard = {
  ERC721A: 0,
  ERC1155: 1,
}

const contractTier = {
  Basic: 0,
  Premium: 1,
  Advanced: 2,
}

module.exports = {
  decimals,
  initialAnswer,
  cost,
  basicTierCost,
  premiumTierCost,
  advancedTierCost,
  newCost,
  mintCost,
  mintCostValue,
  falseMintCostValue,
  merkleRoot,
  merkleProof,
  contractStandard,
  contractTier,
}
