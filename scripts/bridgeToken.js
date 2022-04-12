import { ethers } from "hardhat";

async function main() {
  const TokenForBridge = await ethers.getContractFactory("TokenForBridge");
  const tokenForBridge = await TokenForBridge.deploy(
    "Bridge Address"
  );

  await tokenForBridge.deployed();

  console.log(`Bridge deployed to: ${tokenForBridge.address}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
