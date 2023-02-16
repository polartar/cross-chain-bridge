const hre = require("hardhat");

async function main() {
  const { upgrades } = hre;
  const { fuseBlockAddress } = hre.config.networks[hre.network.name];

  const FuseBlock = await hre.ethers.getContractFactory("FuseBlock");
  // // upgrade contract
  const upgrade = await upgrades.upgradeProxy(fuseBlockAddress, FuseBlock) 
  console.log(upgrade.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
