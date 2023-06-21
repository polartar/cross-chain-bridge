const hre = require("hardhat");

async function main() {
  // We get the contract to deploy
  // const { upgrades } = hre;
  const NFTFactory = await hre.ethers.getContractFactory("MockERC721");
  const nftContract = await NFTFactory.deploy();
  await nftContract.deployed();

  console.log("NFT address:", nftContract.address);

  // Mumbai: 0x83fAb1E91b44947AefCBCa955237B6EA29fe4b3E
  //ZK: 0x0A0253540E28dC8F336312dF9FA6BcF24Df728fB
  //Huji:0x4dc1CC8Ae662f199819E01969b54C99A8879E842
  // await hre.run("verify:verify", {
  //   address: "0x4dc1CC8Ae662f199819E01969b54C99A8879E842",
  //   contract: "contracts/DevToken.sol:DevToken",
  //   constructorArguments: [],
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
