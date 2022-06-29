require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("@openzeppelin/hardhat-upgrades");
require("solidity-coverage");
require("hardhat-gas-reporter");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true
      }
     }
    },
  networks: {
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: [process.env.PRIVATE_KEY]
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: [process.env.PRIVATE_KEY]
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: [process.env.PRIVATE_KEY]
    },
    matic: {
      url: "https://rpc-mainnet.maticvigil.com",
      accounts: [process.env.PRIVATE_KEY],
      auraAddress: "",
      fuseBlockAddress: "",
      itemAddress: ""
    },
    mumbai: {
      // url: "https://rpc-mumbai.maticvigil.com",
      // url: "https://rpc-mumbai.matic.today/",
      url: "https://rpc-mumbai.maticvigil.com/v1/f0ee4a1388582453bd9371fd6378578b976f21b8",
      // url: "https://rpc-mumbai.maticvigil.today/",
      accounts: [process.env.PRIVATE_KEY],
      auraAddress: "",
      fuseBlockAddress: "",
      itemAddress: ""
    },
    avalanche : {
      url: "https://api.avax.network/ext/bc/C/rpc"
    },
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 43113
    },
    local: {
      url: "http://127.0.0.1:13725/ext/bc/2WV8THZYGropJoMjmXHGnFC9HsM1Vhj34ZA9vm1kNMFc9Vzogv/rpc",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 99999
    }
  },
  mocha: {
    timeout: 200000
  },
  etherscan: {
    apiKey: process.env.POLYGON_API_KEY
  },
};
