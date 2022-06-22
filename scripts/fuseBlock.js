const hre = require("hardhat");

async function main() {
  // We get the contract to deploy

  // const MockAura = await hre.ethers.getContractFactory("MockERC20");
  // const mockAura = await MockAura.deploy();

  // await mockAura.deployed();

  // console.log("Aura address: ", mockAura.address);  

  // const FuseBlock = await hre.ethers.getContractFactory("FuseBlock");
  // const fuseBlock = await FuseBlock.deploy("0x49eD8ee91A92986f9976E3e5e25B66351490a0c9");

  // await fuseBlock.deployed();

  // console.log("FuseBlock deployed to:", fuseBlock.address); 
  
  // aura: 0x49eD8ee91A92986f9976E3e5e25B66351490a0c9
  // fuseblock: 0xa591ae9B8766008a80D970f177d84823a75bDd42

  // await hre.run("verify:verify", {
  //   address: "0x49eD8ee91A92986f9976E3e5e25B66351490a0c9",
  //   contract: "contracts/MockERC20.sol:MockERC20",
  //   constructorArguments: [

  //   ]
  // });
  await hre.run("verify:verify", {
    address: "0x45BEdC9A0Ac0D5A358cdcd840F1Fb2efaf1b8671",
    contract: "contracts/FuseBlock.sol:FuseBlock",
    constructorArguments: [
      "0x49eD8ee91A92986f9976E3e5e25B66351490a0c9"
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
