const { expect } = require("chai");
const { parseEther } = require("ethers/lib/utils");
const { ethers, upgrades } = require("hardhat");

describe("FuseBlock", function () {
  let FuseBlock;
  let MockAura;
  let Item;
  let fuseBlock;
  let mockAura;
  let item;
  let admin, user, user1;

  before(async function() {
    [admin, user, user1] = await ethers.getSigners();
    MockAura = await ethers.getContractFactory("MockERC20");
    FuseBlock = await ethers.getContractFactory("FuseBlock");
    Item = await ethers.getContractFactory("Item");
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

    // await mockAura.transfer(fuseBlock.address, parseEther("1000"));
    await mockAura.approve(fuseBlock.address, parseEther("10000"));
    await mockAura.setFuseBlockAddress(fuseBlock.address);
    await mockAura.setItemAddress(item.address);

    await fuseBlock.setItemAddress(item.address);
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

  it("Should modify the baseURI", async function () {
    await fuseBlock.mint(admin.address, parseEther("100"));
    await fuseBlock.setBaseURI("ipfs://testURI");

    const tokenURI = await fuseBlock.tokenURI(1);
    expect(tokenURI).to.be.equal(`ipfs://testURI?tokenId=1`);
  });

  it("Should set the rate", async function () {
    await fuseBlock.mint(admin.address, parseEther("100"));
    const amount = await fuseBlock.getAuraAmount(1);
    expect(amount).to.be.equal(parseEther("100"));

    await fuseBlock.setRealAuraAddress(mockAura.address, 50); // set the $karma:$aura = 1: 0.5;
    const realamount = await fuseBlock.getAuraAmount(1);
    expect(realamount).to.be.equal(parseEther("50"));
  });

  it("Should mint item from fuseBlock", async function () {
    await fuseBlock.mint(user.address, parseEther("100"));
    await expect(fuseBlock.connect(user1).mintItem(1, "uuid", 2, parseEther("10"))).to.be.revertedWith("not token owner");
    await expect(fuseBlock.connect(user).mintItem(1, "uuid", 2, parseEther("101"))).to.be.revertedWith("insufficient aura balance");

    await expect(() =>fuseBlock.connect(user).mintItem(1, "uuid", 2, parseEther("10"))).to.changeTokenBalance(mockAura, fuseBlock, parseEther("-20"));

    expect(await item.balanceOf(user.address, 1)).to.be.equal(2);
    const items = await item.getItemsFromFuseBlock(1);
    expect(items.auraAmount).to.be.equal(parseEther("20"));
    expect(items.itemIds[0]).to.be.equal(1);
    expect(items.itemAmounts[0]).to.be.equal(2);
    expect(items.receiver).to.be.equal(user.address);

    await item.setURI("https://domain.com");
    expect(await item.uri(1)).to.be.eq("https://domain.com?id=uuid")
  });
 
  it("Should cancel items from fuseBlock", async function () {
    await fuseBlock.mint(user.address, parseEther("100"));

    await fuseBlock.connect(user).mintItem(1, "uuid", 2, parseEther("10"));

    await expect(() => fuseBlock.cancelFuseblock(1)).to.changeTokenBalance(mockAura, admin, parseEther("100"));
    
    expect(await fuseBlock.balanceOf(user.address)).to.be.equal(0);
    expect(await item.balanceOf(user.address, 1)).to.be.equal(0);
  });
  
  it("Should not tranfer item nft when fuseblock doesn't meet the requirement", async function () {
    await fuseBlock.mint(user.address, parseEther("100"));

    await fuseBlock.connect(user).mintItem(1, "uuid", 2, parseEther("10"));
   
    await expect(item.connect(user).safeTransferFrom(user.address, user1.address, 1, 1, ethers.utils.formatBytes32String(""))).to.be.revertedWith("fuseblock requirement not mint");
    
    await fuseBlock.setRequirementStatus(1, true);
    await item.connect(user).safeTransferFrom(user.address, user1.address, 1, 1,  ethers.utils.formatBytes32String(""));
    expect(await item.balanceOf(user1.address, 1)).to.be.equal(1);
  });

});
