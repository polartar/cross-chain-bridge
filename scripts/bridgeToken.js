const { ethers } = require ("hardhat");

async function main() {
  const TokenForBridge = await ethers.getContractFactory("TokenForBridge");
  const tokenForBridge = await TokenForBridge.deploy(
    "0xeDec18794210Ca0378354340B440C0f26B050274"
  );

  await tokenForBridge.deployed();

  console.log(`Bridge deployed to: ${tokenForBridge.address}`);

  // mumbai 0x32Cd1845c14F6716fc6a95Ad5755B808116F93B1
  // ropsten 0xE335C1E3FDA54F214616095F715D470D225486b2

  // await hre.run("verify:verify", {
  //   address: "0xE335C1E3FDA54F214616095F715D470D225486b2",
  //   contract: "contracts/TokenBridge.sol:TokenForBridge",
  //   constructorArguments: [
  //     "0xa9A0489EAdBE81E011647ab543735E68dc2f504d"
  //   ],
  // });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
