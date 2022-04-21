const { ethers } = require( "hardhat");

async function main() {
  // const Bridge = await ethers.getContractFactory("Bridge");
  // const bridge = await Bridge.deploy();

  // await bridge.deployed();

  // await bridge.includeToken(
  //   80001,
  //   "0xDBb6826bE6492ADC833FBd567Fa0B4b13AEB64CA"
  // );
  // await bridge.includeToken(
  //   3,
  //   "0xD99195c6753d2B016806c4Bc27b9F85961730cFF"
  // );

  // console.log(`Bridge deployed to: ${bridge.address}`);

  // mumbai: 0xeDec18794210Ca0378354340B440C0f26B050274
  await hre.run("verify:verify", {
    address: "0xeDec18794210Ca0378354340B440C0f26B050274",
    contract: "contracts/Bridge.sol:Bridge",
    constructorArguments: [
      
    ],
  });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
