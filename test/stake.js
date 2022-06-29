const { expect } = require("chai");
const { parseEther } = require("ethers/lib/utils");
const { ethers, upgrades } = require("hardhat");

describe("Stake", function () {
  let FuseBlock;
  let Item;
  let MockAura;
  let Stake;
  let fuseBlock;
  let item;
  let mockAura;
  let stake;
  let admin, user;

  before(async function() {
    [admin, user] = await ethers.getSigners();
    MockAura = await ethers.getContractFactory("MockERC20");
    FuseBlock = await ethers.getContractFactory("FuseBlock");
    Item = await ethers.getContractFactory("Item");
    Stake = await ethers.getContractFactory("Stake");
  })
  beforeEach(async function() {
    mockAura = await upgrades.deployProxy(MockAura, [], {
      kind: "uups"
    });
    await mockAura.deployed();

    fuseBlock = await upgrades.deployProxy(FuseBlock, [mockAura.address], {
      kind: "uups"
    });
    await fuseBlock.deployed();
    
    item = await upgrades.deployProxy(Item, [mockAura.address, fuseBlock.address], {
      kind: "uups"
    })
    await item.deployed();

    await mockAura.approve(fuseBlock.address, parseEther("1000"));
    
    stake = await upgrades.deployProxy(
      Stake,
      [fuseBlock.address, item.address, mockAura.address],
      {
        kind: "uups"
      }
    )
    await stake.deployed();

    await mockAura.setFuseBlockAddress(fuseBlock.address);
    await mockAura.setItemAddress(item.address);
    await mockAura.setStakeAddress(stake.address);

    await fuseBlock.setItemAddress(item.address);

    await fuseBlock.mint(admin.address, parseEther("100"));
    await fuseBlock.mint(admin.address, parseEther("150"));

    await fuseBlock.setApprovalForAll(stake.address, true);
    await mockAura.transfer(stake.address, parseEther("300"));
    await mockAura.approve(stake.address, parseEther("1000"));
  })

  it("Should not stake when fuseBlock does not meet the requirements", async function () {
    await expect(stake.stake(fuseBlock.address, 1, 1)).to.be.revertedWith("requirement not meet");
  });

  it("Should stake fuseBlock", async function () {
    await fuseBlock.setRequirementStatus(1, true);
    await stake.stake(fuseBlock.address, 1, 1);
    
    expect(await fuseBlock.ownerOf(1)).to.be.equal(stake.address);
  });

  it("Should get staked Ids", async function () {
    await fuseBlock.setRequirementStatus(1, true);
    await fuseBlock.setRequirementStatus(2, true);
    await stake.stake(fuseBlock.address, 1, 1);
    await stake.stake(fuseBlock.address, 2, 1);
    
    const stakedIds = await stake.getStakedIds(fuseBlock.address)
    expect(stakedIds[0]).to.be.equal(1)
    expect(stakedIds[1]).to.be.equal(2)
  });

  it("Should unstake fuseBlock", async function () {
    await fuseBlock.setRequirementStatus(1, true);
    await stake.stake(fuseBlock.address, 1, 1);
    expect(await fuseBlock.ownerOf(1)).to.be.equal(stake.address);
    await stake.unstake(fuseBlock.address, 1, 1);
    expect(await fuseBlock.ownerOf(1)).to.be.equal(admin.address);
  });

  it("Should not stake item when fuseBlock does not meet the requirements", async function () {
    await fuseBlock.mintItem(1, "uuid", 2, parseEther("10"))

    await item.setApprovalForAll(stake.address, true);
    await expect(stake.stake(item.address, 1, 2)).to.be.revertedWith("fuseblock requirement not mint");
  });

  it("Should stake item", async function () {
    await fuseBlock.setRequirementStatus(1, true);
    await fuseBlock.mintItem(1, "uuid", 2, parseEther("10"))

    await item.setApprovalForAll(stake.address, true);
    await stake.stake(item.address, 1, 2);
    
    expect(await item.balanceOf(stake.address, 1)).to.be.equal(2);
  });

  it("Should claim rewards", async function () {
    await fuseBlock.setRequirementStatus(1, true);
    await stake.stake(fuseBlock.address, 1, 1);
    
    await ethers.provider.send("evm_increaseTime", [3600 * 2]);
    await ethers.provider.send("evm_mine"); 
    await expect(() => stake.claimRewards()).to.changeTokenBalance(mockAura, admin, parseEther("200"));
  });

  it("Should set the royalty", async function () {
    await fuseBlock.setRequirementStatus(1, true);

    await stake.stake(fuseBlock.address, 1, 1);
    await expect(stake.setRoyalyInfo(user.address, 0)).to.be.revertedWith("invalid fee fraction");
    await expect(stake.setRoyalyInfo(user.address, 10000)).to.be.revertedWith("invalid fee fraction");
    await stake.setRoyalyInfo(user.address, 100);
    
    await ethers.provider.send("evm_increaseTime", [3600 * 2]);
    await ethers.provider.send("evm_mine"); 
    await expect(() => stake.claimRewards()).to.changeTokenBalance(mockAura, user, parseEther("2"));
  });
});
