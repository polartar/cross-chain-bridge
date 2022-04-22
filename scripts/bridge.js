const { parseEther } = require("ethers/lib/utils");
const { ethers } = require( "hardhat");

async function main() {
  const Bridge = await ethers.getContractFactory("Bridge");
  // const bridge = await Bridge.deploy();

  // await bridge.deployed();

  // console.log(`Bridge deployed to: ${bridge.address}`);
  const bridge = Bridge.attach("0xeDec18794210Ca0378354340B440C0f26B050274");
  try {
  await bridge.swap("0x32Cd1845c14F6716fc6a95Ad5755B808116F93B1", "0xE335C1E3FDA54F214616095F715D470D225486b2", parseEther("1"), 3);
  } catch(err) {
    console.log(err)
  }
  // mumbai: 0xeDec18794210Ca0378354340B440C0f26B050274
  //ropsten: 0xa9A0489EAdBE81E011647ab543735E68dc2f504d
  // await hre.run("verify:verify", {
  //   address: "0xa9A0489EAdBE81E011647ab543735E68dc2f504d",
  //   contract: "contracts/Bridge.sol:Bridge",
  //   constructorArguments: [
      
  //   ],
  // });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
