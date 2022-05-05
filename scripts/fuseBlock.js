const hre = require("hardhat");

async function main() {
  // We get the contract to deploy

  // const MockAura = await hre.ethers.getContractFactory("MockERC20");
  // const mockAura = await MockAura.deploy();

  // await mockAura.deployed();

  // console.log("Aura address: ", mockAura.address);  //0x2A34e1a13557cf755a53b0CE2B4ADcE8134967Be

  // const FuseBlock = await hre.ethers.getContractFactory("FuseBlock");
  // const fuseBlock = await FuseBlock.deploy(mockAura.address);

  // await fuseBlock.deployed();

  // console.log("FuseBlock deployed to:", fuseBlock.address); //0x8D5163EaFF18136eAE74298388E0E579032603C3

  // await hre.run("verify:verify", {
  //   address: "0x2A34e1a13557cf755a53b0CE2B4ADcE8134967Be",
  //   contract: "contracts/MockERC20.sol:MockERC20",
  //   constructorArguments: [

  //   ]
  // });
  await hre.run("verify:verify", {
    address: "0x8D5163EaFF18136eAE74298388E0E579032603C3",
    contract: "contracts/FuseBlock.sol:FuseBlock",
    constructorArguments: [
      "0x2A34e1a13557cf755a53b0CE2B4ADcE8134967Be"
    ]
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
