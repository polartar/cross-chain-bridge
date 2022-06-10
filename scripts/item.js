const hre = require("hardhat");

async function main() {
  // const Item = await hre.ethers.getContractFactory("Item");
  // const item = await Item.deploy("0x2A34e1a13557cf755a53b0CE2B4ADcE8134967Be", "0x7025E904e25247879258d7b2c0aAD8cf5c90d252");

  // await item.deployed();

  // console.log("Item deployed to:", item.address); 

   
  await hre.run("verify:verify", {
    address: "0xD17e0cD2C708de7350dE9D1D84E99A79B331F933",
    contract: "contracts/Item.sol:Item",
    constructorArguments: [
      "0x2A34e1a13557cf755a53b0CE2B4ADcE8134967Be",
      "0x7025E904e25247879258d7b2c0aAD8cf5c90d252"
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
