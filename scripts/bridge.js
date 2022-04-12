import { ethers } from "hardhat";

async function main() {
  const Bridge = await ethers.getContractFactory("Bridge");
  const bridge = await Bridge.deploy();

  await bridge.deployed();

  console.log(`Bridge deployed to: ${bridge.address}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
