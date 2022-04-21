const hre = require("hardhat");

async function main() {
  // We get the contract to deploy

  const MockAura = await hre.ethers.getContractFactory("MockERC20");
  const mockAura = await MockAura.deploy();

  await mockAura.deployed();

  console.log("Aura address: ", mockAura.address);  //0xf3644a8896A51b947Dd29CD3e91aE0cbF4dC785A

  const FuseBlock = await hre.ethers.getContractFactory("FuseBlock");
  const fuseBlock = await FuseBlock.deploy(mockAura.address);

  await fuseBlock.deployed();

  console.log("FuseBlock deployed to:", fuseBlock.address); //0x3579F235D13419ABD8B4784aB24282283f3AcBB0

  // await hre.run("verify:verify", {
  //   address: "0xf3644a8896A51b947Dd29CD3e91aE0cbF4dC785A",
  //   contract: "contracts/MockERC20.sol:MockERC20",
  //   constructorArguments: [

  //   ]
  // });
  // await hre.run("verify:verify", {
  //   address: "0x3579F235D13419ABD8B4784aB24282283f3AcBB0",
  //   contract: "contracts/FuseBlock.sol:FuseBlock",
  //   constructorArguments: [
  //     "0xf3644a8896A51b947Dd29CD3e91aE0cbF4dC785A"
  //   ]
  // });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
