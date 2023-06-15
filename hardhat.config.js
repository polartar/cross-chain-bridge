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
        enabled: true,
      },
    },
  },
  networks: {
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
    },
    matic: {
      // url: "https://rpc-mainnet.maticvigil.com",
      url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY_MATIC}`,
      accounts: [process.env.PRIVATE_KEY],
      auraAddress: "0xbDDCc0E86564B4A8Eb1df352CFb2B7629488Dd96",
      fuseBlockAddress: "0x95959432293943D77Ed3e2eA065E9D65A21d0227",
      itemAddress: "0x668d923D4be2ffF8EC7645a1E5Cebb57102493Ba",
      stakeAddress: "0x479644b1c2fbbB1713ef56038b26292609554189",
    },
    mumbai: {
      // url: "https://rpc-mumbai.maticvigil.com",
      // url: "https://rpc-mumbai.matic.today/",
      url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_KEY_MUMBAI}`,
      // url: "https://rpc-mumbai.maticvigil.today/",
      accounts: [process.env.PRIVATE_KEY],
      //stage
      // auraAddress: "0x03862b4fC815bf15Aa442C58F090F4D8aC739649",
      // fuseBlockAddress: "0xadab77264f77EE0871eD0ecf8Fec2cBC167A8E3E",
      // itemAddress: "0xF77C50F688ccCd5936E77f9dc5fA72234dB29610",

      // dev
      auraAddress: "0x5210A32bC4d3aFf0C7596Fe592d28aE50F9b75fd",
      fuseBlockAddress: "0xb137b694E05D0C2D2E4D40C3267e1f4007A73b73",
      itemAddress: "0x90E45D789717c9A179F8DA5A8BDdd5c564E928fc",
      stakeAddress: "0x7B7c18ecA83455da4181bB48D52285d92F1487fc",
    },
    "base-goerli": {
      url: `https://goerli.base.org`,
      accounts: [process.env.PRIVATE_KEY],
    },
    avalanche: {
      url: "https://api.avax.network/ext/bc/C/rpc",
    },
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 43113,
    },
    local: {
      url: "http://127.0.0.1:13725/ext/bc/2WV8THZYGropJoMjmXHGnFC9HsM1Vhj34ZA9vm1kNMFc9Vzogv/rpc",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 99999,
    },
    zk_test: {
      url: `https://polygonzkevm-testnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY_ZK_TEST}`,
      accounts: [process.env.PRIVATE_KEY],
      auraAddress: "0x4c16D9032560600Db5Bd1211965a2982be7e0fEA",
    },
  },
  mocha: {
    timeout: 200000,
  },
  etherscan: {
    apiKey: process.env.POLYGON_API_KEY,
  },
};
