const { expect } = require("chai");
const { parseEther } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

describe("FuseBlock", function () {
  let FuseBlock;
  let MockAura;
  let Stake;
  let fuseBlock;
  let mockAura;
  let stake;
  let admin, user;

  before(async function() {
    [admin, user] = await ethers.getSigners();
    MockAura = await ethers.getContractFactory("MockERC20");
    FuseBlock = await ethers.getContractFactory("FuseBlock");
    Stake = await ethers.getContractFactory("Stake");
  })
  beforeEach(async function() {
    mockAura = await MockAura.deploy();
    await mockAura.deployed();

    fuseBlock = await FuseBlock.deploy(mockAura.address);
    await fuseBlock.deployed();

    await mockAura.approve(fuseBlock.address, parseEther("1000"));
    
    stake = await Stake.deploy(fuseBlock.address, mockAura.address);
    await stake.deployed();

    fuseBlock.mint(parseEther("100"));
    fuseBlock.mint(parseEther("150"));

    fuseBlock.setApprovalForAll(stake.address, true);
    mockAura.transfer(stake.address, parseEther("300"));
    mockAura.approve(stake.address, parseEther("1000"));
  })

  it("Should stake fuseBlock", async function () {
    await stake.stake(1);
    
    expect(await fuseBlock.ownerOf(1)).to.be.equal(stake.address);
  });

  it("Should claim rewards", async function () {
    await stake.stake(1);
    
    await ethers.provider.send("evm_increaseTime", [3600 * 2]);
    await ethers.provider.send("evm_mine"); 
    await expect(() => stake.claimRewards()).to.changeTokenBalance(mockAura, admin, parseEther("200"));
  });

  it("Should set the royalty", async function () {
    await stake.stake(1);
    await expect(stake.setRoyalyInfo(user.address, 0)).to.be.revertedWith("invalid fee fraction");
    await expect(stake.setRoyalyInfo(user.address, 10000)).to.be.revertedWith("invalid fee fraction");
    await stake.setRoyalyInfo(user.address, 100);
    
    await ethers.provider.send("evm_increaseTime", [3600 * 2]);
    await ethers.provider.send("evm_mine"); 
    await expect(() => stake.claimRewards()).to.changeTokenBalance(mockAura, user, parseEther("2"));
  });
});
