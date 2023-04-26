const hre = require("hardhat");

async function main() {
  // We get the contract to deploy
  // const { upgrades } = hre;
  const MockAura = await hre.ethers.getContractFactory("MockERC20");
  const mockAura = await upgrades.deployProxy(MockAura, [], {
    kind: "uups",
  });

  const tx1 = await mockAura.deployed();
  await tx1.wait();

  console.log("Aura address: ", mockAura.address);

  const FuseBlock = await hre.ethers.getContractFactory("FuseBlock");
  // const fuseBlock = await upgrades.upgradeProxy("0xca2ff93daFCFB952eFBDc445dA82081e9E6A32E8", FuseBlock)
  const fuseBlock = await upgrades.deployProxy(FuseBlock, [mockAura.address], {
    kind: "uups",
  });

  const tx2 = await fuseBlock.deployed();

  console.log("FuseBlock deployed to:", fuseBlock.address);
  await tx2.wait();

  await hre.run("verify:verify", {
    address: mockAura.address,
    contract: "contracts/MockERC20.sol:MockERC20",
    constructorArguments: [],
  });
  await hre.run("verify:verify", {
    address: fuseBlock.address,
    contract: "contracts/FuseBlock.sol:FuseBlock",
    constructorArguments: [mockAura.address],
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
