const hre = require("hardhat");

async function main() {
  // We get the contract to deploy
  // const Stake = await hre.ethers.getContractFactory("Stake");
  // const stake = await Stake.deploy("0x8D5163EaFF18136eAE74298388E0E579032603C3", "0x2A34e1a13557cf755a53b0CE2B4ADcE8134967Be");

  // await stake.deployed();

  // console.log("Stake deployed to:", stake.address); //0x60215b74ce3A3BeFA7356531D84b32a6196608C0

  await hre.run("verify:verify", {
    address: "0x60215b74ce3A3BeFA7356531D84b32a6196608C0",
    contract: "contracts/Stake.sol:Stake",
    constructorArguments: [
        "0x8D5163EaFF18136eAE74298388E0E579032603C3",
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
