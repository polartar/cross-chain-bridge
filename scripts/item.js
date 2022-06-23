const hre = require("hardhat");

async function main() {
  // const Item = await hre.ethers.getContractFactory("Item");
  // const item = await Item.deploy("0x74d75261Ab56d752E2c7AE6298E58Cd2f0D70B5a", "0xe9E4724997447B6C76494Fa1b44F05A490eD6A57");

  // await item.deployed();

  // console.log("Item deployed to:", item.address); 

   
  await hre.run("verify:verify", {
    address: "0x52e67E6C977441297FA6E83D948DB843bdD4955C",
    contract: "contracts/Item.sol:Item",
    constructorArguments: [
      "0x74d75261Ab56d752E2c7AE6298E58Cd2f0D70B5a",
      "0xe9E4724997447B6C76494Fa1b44F05A490eD6A57"
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
