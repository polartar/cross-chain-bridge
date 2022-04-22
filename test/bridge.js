const { artifacts, ethers, waffle } = require("hardhat");
const { Artifact } = require ("hardhat/types");
const { expect }  = require("chai");
describe("Contract bridge testing", async function () {
  before(async function () {
    this.network = await ethers.provider.getNetwork();

    this.chainIdBSC = 97;
    this.testAmount = 1e9;
    [
      this.ownerETH,
      this.ownerBSC,
      this.ownerBridgeETH,
      this.ownerBridgeBSC,
      this.acc,
    ] = await ethers.getSigners();
  });
  beforeEach(async function () {
    this.nonce = 0;

    const artifactBridgeETH = await artifacts.readArtifact("Bridge");

    this.instanceBridgeETH = await waffle.deployContract(
      this.ownerBridgeETH,
      artifactBridgeETH
    );

    const artifactETHtoken = await artifacts.readArtifact(
      "TokenForBridge"
    );

    this.instanceETHToken = await waffle.deployContract(
      this.ownerETH,
      artifactETHtoken,
      [this.instanceBridgeETH.address]
    );
    this.nonce = 0;

    const artifactBridgeBSC = await artifacts.readArtifact("Bridge");

    this.instanceBridgeBSC = await waffle.deployContract(
      this.ownerBridgeBSC,
      artifactBridgeBSC
    );

    const artifactBSCtoken = await artifacts.readArtifact(
      "TokenForBridge"
    );

    this.instanceBSCToken = await waffle.deployContract(
      this.ownerBSC,
      artifactBSCtoken,
      [this.instanceBridgeBSC.address]
    );

    await this.instanceBSCToken.mint(this.acc.address, this.testAmount);
    await this.instanceETHToken.mint(this.acc.address, this.testAmount);
    await this.instanceBridgeETH.includeToken(
      this.chainIdBSC,
      this.instanceBSCToken.address
    );
    await this.instanceBridgeETH.includeToken(
      this.network.chainId,
      this.instanceETHToken.address
    );
    await this.instanceBridgeBSC.includeToken(
      this.network.chainId,
      this.instanceETHToken.address
    );
    await this.instanceBridgeBSC.includeToken(
      this.chainIdBSC,
      this.instanceBSCToken.address
    );
  });
  it("BRIDGE-SWAP: The balance is expected to be zero after the swap", async function () {
    await this.instanceBridgeETH
      .connect(this.acc)
      .swap(
        this.instanceETHToken.address,
        this.instanceBSCToken.address,
        this.testAmount,
        this.chainIdBSC
      );

    const balance = await this.instanceETHToken.balanceOf(this.acc.address);

    expect(balance).to.eq(0);
  });
  it("BRIDGE-SWAP: ZeroAddress is expected to return", async function () {
    await expect(
      this.instanceBridgeETH
        .connect(this.acc)
        .swap(
          ethers.constants.AddressZero,
          this.instanceBSCToken.address,
          this.testAmount,
          this.chainIdBSC
        )
    ).to.be.revertedWith("ZeroAddress()");
  });
  it("BRIDGE-SWAP: ZeroAddress is expected to return", async function () {
    await expect(
      this.instanceBridgeETH
        .connect(this.acc)
        .swap(
          this.instanceETHToken.address,
          ethers.constants.AddressZero,
          this.testAmount,
          this.chainIdBSC
        )
    ).to.be.revertedWith("ZeroAddress()");
  });
  it("BRIDGE-SWAP: IncorrectAction is expected to return", async function () {
    await expect(
      this.instanceBridgeETH
        .connect(this.acc)
        .swap(
          this.ownerETH.address,
          this.instanceBSCToken.address,
          this.testAmount,
          this.chainIdBSC
        )
    ).to.be.revertedWith(`IncorrectAction("${this.ownerETH.address}", false)`);
  });
  it("BRIDGE-SWAP: IncorrectAction is expected to return", async function () {
    await expect(
      this.instanceBridgeETH
        .connect(this.acc)
        .swap(
          this.instanceETHToken.address,
          this.ownerETH.address,
          this.testAmount,
          this.chainIdBSC
        )
    ).to.be.revertedWith(`IncorrectAction("${this.ownerETH.address}", false)`);
  });
  it("BRIDGE-REEDEM: After reedem the balance is expected to be 2e9", async function () {
    const swap = await this.instanceBridgeETH
      .connect(this.acc)
      .swap(
        this.instanceETHToken.address,
        this.instanceBSCToken.address,
        this.testAmount,
        this.chainIdBSC
      );
    const { events } = await swap.wait();
    const event = events.find((it) => it.event === "Swap").args;
    const [_tokenTo, _to, _amount, _nonce] = event;
    const hash = await ethers.utils.solidityKeccak256(
      ["address", "address", "uint256", "uint256"],
      [_tokenTo, _to, +_amount, +_nonce]
    );
    const signature = await this.ownerBridgeBSC.signMessage(
      ethers.utils.arrayify(hash)
    );

    await this.instanceBridgeBSC.reedem(
      _tokenTo,
      _to,
      _amount,
      _nonce,
      signature
    );

    const balance = await this.instanceBSCToken.balanceOf(this.acc.address);

    expect(balance).to.eq(2e9);
  });
  it("BRIDGE-REEDEM: IncorrectSignature is expected to return", async function () {
    const swap = await this.instanceBridgeETH
      .connect(this.acc)
      .swap(
        this.instanceETHToken.address,
        this.instanceBSCToken.address,
        this.testAmount,
        this.chainIdBSC
      );
    const { events } = await swap.wait();
    const event = events.find((it) => it.event === "Swap").args;
    const [_tokenTo, _to, _amount, _nonce] = event;
    const hash = await ethers.utils.solidityKeccak256(
      ["address", "address", "uint256", "uint256"],
      [_tokenTo, _to, +_amount, +_nonce]
    );
    const signature = await this.ownerBridgeBSC.signMessage(
      ethers.utils.arrayify(hash)
    );

    await expect(
      this.instanceBridgeBSC.reedem(_tokenTo, _to, _amount, 0, signature)
    ).to.be.revertedWith("IncorrectSignature()");
  });
});
