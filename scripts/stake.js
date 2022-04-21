const hre = require("hardhat");

async function main() {
  // We get the contract to deploy
  // const Stake = await hre.ethers.getContractFactory("Stake");
  // const stake = await Stake.deploy("0x3579F235D13419ABD8B4784aB24282283f3AcBB0", "0xf3644a8896A51b947Dd29CD3e91aE0cbF4dC785A");

  // await stake.deployed();

  // console.log("Stake deployed to:", stake.address); //0x5196D52815488271937d0eDaE53a3855A5615597

  await hre.run("verify:verify", {
    address: "0x2DB157dedd6f86c4e0FD69a06A6fDe4C5EAa4651",
    contract: "contracts/Stake.sol:Stake",
    constructorArguments: [
        "0x3579F235D13419ABD8B4784aB24282283f3AcBB0",
        "0xf3644a8896A51b947Dd29CD3e91aE0cbF4dC785A"
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
