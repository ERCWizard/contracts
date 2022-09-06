const decimals = 8
const initialAnswer = 100000000
const cost = '10000000000000000000'
const newCost = '20000000000000000000'
const mintCost = '11'
const mintCostValue = { value: cost }
const falseMintCostValue = { value: newCost }
const merkleRoot =
  '0xf94888b18e06ff7436a3d934ebeb2ad9e8a4eca64215758d2eed3415fc565ff0'
const merkleProof = [
  '0x09475e4e2909eb21dd8c353acb89220aa0d9be393112dc4b540bb9486c8b6421',
]

module.exports = {
  decimals,
  initialAnswer,
  cost,
  newCost,
  mintCost,
  mintCostValue,
  falseMintCostValue,
  merkleRoot,
  merkleProof,
}
