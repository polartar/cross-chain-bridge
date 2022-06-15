const { expect } = require("chai");
const { parseEther } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

describe("FuseBlock", function () {
  let FuseBlock;
  let MockAura;
  let fuseBlock;
  let mockAura;
  let admin, user, user1;

  before(async function() {
    [admin, user, user1] = await ethers.getSigners();
    MockAura = await ethers.getContractFactory("MockERC20");
    FuseBlock = await ethers.getContractFactory("FuseBlock");
  })
  beforeEach(async function() {
    mockAura = await MockAura.deploy();
    await mockAura.deployed();

    fuseBlock = await FuseBlock.deploy(mockAura.address);
    await fuseBlock.deployed();

    // await mockAura.transfer(fuseBlock.address, parseEther("1000"));
    await mockAura.approve(fuseBlock.address, parseEther("1000"));
    await mockAura.setFuseBlockAddress(fuseBlock.address);
  })

  it("Should get total aura amount", async function () {
    const amount = await fuseBlock.getTotalAuraAmount();
    expect(amount).to.be.equal(parseEther("0"));
   });
 
  it("Should Mint NFT", async function () {
   await fuseBlock.mint(user.address, parseEther("100"));

   expect(await fuseBlock.ownerOf(1)).to.be.equal(user.address);
   const amount = await fuseBlock.getAuraAmount(1);
   expect(amount).to.be.equal(parseEther("100"));
  });

  it("Should have minimum Aura amount", async function () {
     await expect(fuseBlock.mint(user.address, parseEther("1"))).to.be.revertedWith("should include minimum aura");
   });
  
   it("Should only admin set the minimum Aura amount", async function () {
     await expect(fuseBlock.connect(user).setMinAuraAmount(parseEther("10"))).to.be.revertedWith("Ownable: caller is not the owner");
     await fuseBlock.setMinAuraAmount(parseEther("10"));

     await expect(fuseBlock.mint(user.address, parseEther("9"))).to.be.revertedWith("should include minimum aura");
     await fuseBlock.mint(user.address, parseEther("10"));
   });

  it("Should Burn NFT", async function () {
    await fuseBlock.mint(admin.address, parseEther("100"));
    await expect(fuseBlock.connect(user).burn(1)).to.be.revertedWith("not owner of the token");
    await expect(() => fuseBlock.burn(1)).to.changeTokenBalance(mockAura, admin, parseEther("100"));
    await expect(fuseBlock.ownerOf(1)).to.be.reverted;
  });

  it("Should not transfer if requirements doesn't meet", async function () {
    await fuseBlock.mint(admin.address, parseEther("100"));
    
    // transfer NFT from admin to user;
    await expect(fuseBlock.transferFrom(admin.address, user.address, 1)).to.be.revertedWith("requirement not meet");
    
    await fuseBlock.setRequirementStatus(1, true);
    fuseBlock.transferFrom(admin.address, user.address, 1);
    expect(await fuseBlock.ownerOf(1)).to.be.equal(user.address);
  });

  it("Should user gets the aura token after NFT ownership is changed from admin to user", async function () {
    await fuseBlock.mint(admin.address, parseEther("100"));
    
    await fuseBlock.setRequirementStatus(1, true);
    fuseBlock.transferFrom(admin.address, user.address, 1);

    // check if user gets the aura from the NFT when it is burned
    await expect(fuseBlock.connect(user1).burn(1)).to.be.revertedWith("not owner of the token");
    await expect(() => fuseBlock.connect(user).burn(1)).to.changeTokenBalance(mockAura, user, parseEther("100"));
  });

  it(`Should return tokenURI`, async function () {
    await fuseBlock.mint(admin.address, parseEther("100"));
    
    const tokenURI = await fuseBlock.tokenURI(1);
    expect(tokenURI).to.be.equal(`https://ipfs.io/ipfs/QmbaD9hWLx3hu2yzH1Uo7mu6236jnekC9dzmxHM3NKvKhL/1.png`);
  });
  
  it("Should modify the baseURI", async function () {
    await fuseBlock.mint(admin.address, parseEther("100"));
    await fuseBlock.setBaseURI("ipfs://testURI");

    const tokenURI = await fuseBlock.tokenURI(1);
    expect(tokenURI).to.be.equal(`ipfs://testURI/1.png`);
  });

  it("Should set the rate", async function () {
    // await expect(fuseBlock.setRate(101)).to.be.revertedWith("rate should be within 1-100");
    // await expect(fuseBlock.setRate(0)).to.be.revertedWith("rate should be within 1-100");

    // await fuseBlock.setRate(50);  // set the $karma:$aura = 1: 0.5;

    await fuseBlock.mint(admin.address, parseEther("100"));
    const amount = await fuseBlock.getAuraAmount(1);
    expect(amount).to.be.equal(parseEther("100"));

    await fuseBlock.setRealAuraAddress(mockAura.address, 50); // set the $karma:$aura = 1: 0.5;
    const realamount = await fuseBlock.getAuraAmount(1);
    expect(realamount).to.be.equal(parseEther("50"));
  });
});
