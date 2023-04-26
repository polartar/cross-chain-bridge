const hre = require("hardhat");

async function main() {
  // We get the contract to deploy
  // const { upgrades } = hre;
  // const DevToken = await hre.ethers.getContractFactory("DevToken");
  // const devToken = await DevToken.deploy();

  // await devToken.deployed();

  // console.log("DevToken address: ", devToken.address);
  // //0x087A736312f87144AC86073F908c31349856066A

  await hre.run("verify:verify", {
    address: "0x4dc1CC8Ae662f199819E01969b54C99A8879E842",
    contract: "contracts/DevToken.sol:DevToken",
    constructorArguments: [],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
