const hre = require("hardhat");

async function main() {
  // We get the contract to deploy
  const { upgrades } = hre;
  const { fuseBlockAddress, auraAddress, itemAddress } = hre.config.networks[hre.network.name];
  const Stake = await hre.ethers.getContractFactory("Stake");

  const stake = await upgrades.deployProxy(
    Stake, 
    [fuseBlockAddress, itemAddress, auraAddress],
    {
      kind: "uups"
    }
  )
  await stake.deployed();

  console.log("Stake deployed to:", stake.address); 

  const MockAura = await hre.ethers.getContractFactory("MockERC20");
  const FuseBlock = await hre.ethers.getContractFactory("FuseBlock");
  const Item = await hre.ethers.getContractFactory("Item");

  const mockAura = await MockAura.attach(auraAddress);
  await mockAura.setFuseBlockAddress(fuseBlockAddress);
  await mockAura.setItemAddress(itemAddress);
  await mockAura.setStakeAddress(stake.address);
  await mockAura.approve(fuseBlockAddress, ethers.constants.MaxUint256);

  const fuseBlock = await FuseBlock.attach(fuseBlockAddress);
  await fuseBlock.setItemAddress(itemAddress);

  await fuseBlock.setApprovalForAll(stake.address, true);
  await mockAura.transfer(stake.address, parseEther("10000000"));
  await mockAura.approve(stake.address, ethers.constants.MaxUint256);

  const item = await Item.attach(itemAddress);
  await item.setApprovalForAll(stake.address, true);
  // await hre.run("verify:verify", {
  //   address: "0xF5da9714D50DD9363FCBF20618D8D31eDc579f71",
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
