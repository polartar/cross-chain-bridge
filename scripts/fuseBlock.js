const hre = require("hardhat");

async function main() {
  // We get the contract to deploy

  // const MockAura = await hre.ethers.getContractFactory("MockERC20");
  // const mockAura = await MockAura.deploy();

  // await mockAura.deployed();

  // console.log("Aura address: ", mockAura.address);  

  // const FuseBlock = await hre.ethers.getContractFactory("FuseBlock");
  // const fuseBlock = await FuseBlock.deploy(mockAura.address);

  // await fuseBlock.deployed();

  // console.log("FuseBlock deployed to:", fuseBlock.address); 
  
  // aura: 0x74d75261Ab56d752E2c7AE6298E58Cd2f0D70B5a
  // fuseblock: 0xe9E4724997447B6C76494Fa1b44F05A490eD6A57

  await hre.run("verify:verify", {
    address: "0x74d75261Ab56d752E2c7AE6298E58Cd2f0D70B5a",
    contract: "contracts/MockERC20.sol:MockERC20",
    constructorArguments: [

    ]
  });
  await hre.run("verify:verify", {
    address: "0xe9E4724997447B6C76494Fa1b44F05A490eD6A57",
    contract: "contracts/FuseBlock.sol:FuseBlock",
    constructorArguments: [
      "0x74d75261Ab56d752E2c7AE6298E58Cd2f0D70B5a"
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
