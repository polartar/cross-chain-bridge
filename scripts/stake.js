const hre = require("hardhat");

async function main() {
  // We get the contract to deploy
  const Stake = await hre.ethers.getContractFactory("Stake");
  const stake = await Stake.deploy("0xe9E4724997447B6C76494Fa1b44F05A490eD6A57","0x52e67E6C977441297FA6E83D948DB843bdD4955C", "0x74d75261Ab56d752E2c7AE6298E58Cd2f0D70B5a");

  await stake.deployed();

  console.log("Stake deployed to:", stake.address); //0xb1ec706b550755e7B07079d1173996B41c026336

  // await hre.run("verify:verify", {
  //   address: "0xa77aeB205CcfF21D1395dF1708Df85aB93A74612",
  //   contract: "contracts/Stake.sol:Stake",
  //   constructorArguments: [
  //       "0xe9E4724997447B6C76494Fa1b44F05A490eD6A57",
  //       "0x52e67E6C977441297FA6E83D948DB843bdD4955C",
  //       "0x74d75261Ab56d752E2c7AE6298E58Cd2f0D70B5a"
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
