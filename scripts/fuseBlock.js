const hre = require("hardhat");

async function main() {
  // We get the contract to deploy

  // const MockAura = await hre.ethers.getContractFactory("MockERC20");
  // const mockAura = await MockAura.deploy();

  // await mockAura.deployed();

  // console.log("Aura address: ", mockAura.address);  
  // //0x2A34e1a13557cf755a53b0CE2B4ADcE8134967Be
  // //0xf3644a8896A51b947Dd29CD3e91aE0cbF4dC785A avalanche

  // const FuseBlock = await hre.ethers.getContractFactory("FuseBlock");
  // const fuseBlock = await FuseBlock.deploy("0x2A34e1a13557cf755a53b0CE2B4ADcE8134967Be");

  // await fuseBlock.deployed();

  // console.log("FuseBlock deployed to:", fuseBlock.address); 
  //0x4c16D9032560600Db5Bd1211965a2982be7e0fEA
  //0x3579F235D13419ABD8B4784aB24282283f3AcBB0 avalanche

  // await hre.run("verify:verify", {
  //   address: "0xf3644a8896A51b947Dd29CD3e91aE0cbF4dC785A",
  //   contract: "contracts/MockERC20.sol:MockERC20",
  //   constructorArguments: [

  //   ]
  // });
  await hre.run("verify:verify", {
    address: "0x7025E904e25247879258d7b2c0aAD8cf5c90d252",
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
