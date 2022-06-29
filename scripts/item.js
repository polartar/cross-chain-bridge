const hre = require("hardhat");

async function main() {
  const { upgrades } = hre;
  const { fuseBlockAddress, auraAddress } = hre.config.networks[hre.network.name];

  const Item = await hre.ethers.getContractFactory("Item");
  const item = await upgrades.upgradeProxy(Item, [auraAddress, fuseBlockAddress], {
    kind: "uups"
  })

  await item.deployed();

  console.log("Item deployed to:", item.address); 

   
  // await hre.run("verify:verify", {
  //   address: "0xB93518b3Bdc91d5bB9613b1724Ed7FB03862E669",
  //   contract: "contracts/Item.sol:Item",
  //   constructorArguments: [
  //     auraAddress,
  //     fuseBlockAddress
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
