const hre = require("hardhat");

async function main() {
  // We get the contract to deploy
  const { upgrades } = hre;
  const [deployer] = await ethers.getSigners();
  console.log("Deployer", await deployer.getAddress());
  const feeData = await deployer.provider.getFeeData();
  const MockAura = await hre.ethers.getContractFactory("MockERC20");
  const mockAura = await MockAura.deploy({
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    maxFeePerGas: feeData.maxFeePerGas * 2,
  });

  const tx1 = await mockAura.deployed();
  await tx1.deployTransaction.wait();

  console.log("Aura address: ", mockAura.address);

  await hre.run("verify:verify", {
    address: mockAura.address,
    contract: "contracts/MockERC20.sol:MockERC20",
    constructorArguments: [],
  });
  return;
  const FuseBlock = await hre.ethers.getContractFactory("FuseBlock");
  // const fuseBlock = await upgrades.upgradeProxy("0xca2ff93daFCFB952eFBDc445dA82081e9E6A32E8", FuseBlock)
  const fuseBlock = await upgrades.deployProxy(FuseBlock, [mockAura.address], {
    kind: "uups",
  });

  const tx2 = await fuseBlock.deployed();

  console.log("FuseBlock deployed to:", fuseBlock.address);
  await tx2.deployTransaction.wait();

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
