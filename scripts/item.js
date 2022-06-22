const hre = require("hardhat");

async function main() {
  const Item = await hre.ethers.getContractFactory("Item");
  const item = await Item.deploy("0x49eD8ee91A92986f9976E3e5e25B66351490a0c9", "0x45BEdC9A0Ac0D5A358cdcd840F1Fb2efaf1b8671");

  await item.deployed();

  console.log("Item deployed to:", item.address); 

   
  // await hre.run("verify:verify", {
  //   address: "0x95Ded6A8Dc881E568C5125CA7196AAA5998dEB14",
  //   contract: "contracts/Item.sol:Item",
  //   constructorArguments: [
  //     "0x49eD8ee91A92986f9976E3e5e25B66351490a0c9",
  //     "0x45BEdC9A0Ac0D5A358cdcd840F1Fb2efaf1b8671"
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
