const hre = require("hardhat");

async function main() {
  // We get the contract to deploy
  const FuseBlock = await hre.ethers.getContractFactory("FuseBlock");
  const fuseBlock = await FuseBlock.deploy("Aura Address");

  await fuseBlock.deployed();

  console.log("FuseBlock deployed to:", fuseBlock.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
