const hre = require("hardhat");

async function main() {
  // const Item = await hre.ethers.getContractFactory("Item");
  // const item = await Item.deploy("0x2A34e1a13557cf755a53b0CE2B4ADcE8134967Be", "0x21c5160C38F5C61Eb198195390365Bc0173B7238");

  // await item.deployed();

  // console.log("Item deployed to:", item.address); 

   
  await hre.run("verify:verify", {
    address: "0x5Eb37c09C6AF715618c5400232F975C510296e73",
    contract: "contracts/Item.sol:Item",
    constructorArguments: [
      "0x2A34e1a13557cf755a53b0CE2B4ADcE8134967Be",
      "0x21c5160C38F5C61Eb198195390365Bc0173B7238"
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
