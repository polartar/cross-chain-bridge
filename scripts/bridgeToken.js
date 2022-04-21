const { ethers } = require ("hardhat");

async function main() {
  // const TokenForBridge = await ethers.getContractFactory("TokenForBridge");
  // const tokenForBridge = await TokenForBridge.deploy(
  //   "0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03"
  // );

  // await tokenForBridge.deployed();

  // console.log(`Bridge deployed to: ${tokenForBridge.address}`);

  // mumbai 0xDBb6826bE6492ADC833FBd567Fa0B4b13AEB64CA
  // ropsten 0xD99195c6753d2B016806c4Bc27b9F85961730cFF

  await hre.run("verify:verify", {
    address: "0xDBb6826bE6492ADC833FBd567Fa0B4b13AEB64CA",
    contract: "contracts/TokenBridge.sol:TokenForBridge",
    constructorArguments: [
      "0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03"
    ],
  });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
