const verify = async (run, contractName, address, constructorArguments) => {
  if (!address) {
    throw new Error(`undefined contract address for ${contractName}`)
  }
  try {
    await run('verify:verify', {
      address,
      constructorArguments,
      contract: contractName,
    })
  } catch (err) {
    if (
      err.message.includes('Reason: Already Verified') ||
      err.message.includes('already verified')
    ) {
      console.log('Contract is already verified!')
    } else {
      throw err
    }
  }
}

module.exports = { verify }
