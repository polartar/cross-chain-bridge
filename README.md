# Basic Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```

## Install the project
   Clone this repo and run `npm install`
## How to compile the project?
  
  npx hardhat compile

## How to test the project?

  npx hardhat test

## How to deploy the contracts?

  npx hardhat run scripts/sample-script.js --network [networkname]

## How to verify the contracts?
  
  npx hardhat verify [contract_address] --network [network name] [constructor parameters]