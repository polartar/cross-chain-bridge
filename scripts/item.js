const hre = require("hardhat");

async function main() {
  // const Item = await hre.ethers.getContractFactory("Item");
  // const item = await Item.deploy("0x2A34e1a13557cf755a53b0CE2B4ADcE8134967Be", "0xF60848d10Dc59B9813e98Aa394d7Af97E75E1F96");

  // await item.deployed();

  // console.log("Item deployed to:", item.address); 

   
  await hre.run("verify:verify", {
    address: "0x064085Bf72ffdd89d19bbb85fA11bc90E4cD8247",
    contract: "contracts/Item.sol:Item",
    constructorArguments: [
      "0x2A34e1a13557cf755a53b0CE2B4ADcE8134967Be",
      "0xF60848d10Dc59B9813e98Aa394d7Af97E75E1F96"
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
