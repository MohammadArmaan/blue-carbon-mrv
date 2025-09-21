const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("FairFund", function () {
  async function deployFairFundFixture() {
    const [owner, donor, farmer, other] = await ethers.getSigners();

    const FairFund = await ethers.getContractFactory("FairFund");
    const fairFund = await FairFund.deploy();

    return { fairFund, owner, donor, farmer, other };
  }

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      const { fairFund, owner } = await loadFixture(deployFairFundFixture);
      expect(await fairFund.owner()).to.equal(owner.address);
    });
  });

  describe("Donor Registration", function () {
    it("Should allow donor to register", async function () {
      const { fairFund, donor } = await loadFixture(deployFairFundFixture);

      await fairFund.connect(donor).registerDonor("AidOrg", "Helping farmers");
      const donorStats = await fairFund.getDonorStats(donor.address);
      expect(donorStats.name).to.equal("AidOrg");
      expect(donorStats.description).to.equal("Helping farmers");
    });

    it("Should emit DonorRegistered event", async function () {
      const { fairFund, donor } = await loadFixture(deployFairFundFixture);

      await expect(fairFund.connect(donor).registerDonor("AidOrg", "Helping farmers"))
        .to.emit(fairFund, "DonorRegistered")
        .withArgs(donor.address, "AidOrg");
    });

    it("Should not allow duplicate donor registration", async function () {
      const { fairFund, donor } = await loadFixture(deployFairFundFixture);

      await fairFund.connect(donor).registerDonor("AidOrg", "Helping farmers");
      await expect(fairFund.connect(donor).registerDonor("Again", "Nope")).to.be.revertedWith(
        "Donor already registered"
      );
    });
  });

  describe("Farmer Registration", function () {
    it("Should allow farmer to register", async function () {
      const { fairFund, farmer } = await loadFixture(deployFairFundFixture);

      await fairFund.connect(farmer).registerFarmer("Ravi", "Village A", "Organic");
      const stats = await fairFund.getFarmerStats(farmer.address);
      expect(stats.name).to.equal("Ravi");
      expect(stats.location).to.equal("Village A");
    });

    it("Should emit FarmerRegistered event", async function () {
      const { fairFund, farmer } = await loadFixture(deployFairFundFixture);

      await expect(
        fairFund.connect(farmer).registerFarmer("Ravi", "Village A", "Organic")
      ).to.emit(fairFund, "FarmerRegistered")
        .withArgs(farmer.address, "Ravi", "Village A");
    });

    it("Should not allow duplicate farmer registration", async function () {
      const { fairFund, farmer } = await loadFixture(deployFairFundFixture);

      await fairFund.connect(farmer).registerFarmer("Ravi", "Village A", "Organic");
      await expect(
        fairFund.connect(farmer).registerFarmer("Ravi2", "Village B", "Traditional")
      ).to.be.revertedWith("Farmer already registered");
    });
  });

  describe("Disbursements", function () {
    it("Should allow verified donor to create a disbursement", async function () {
      const { fairFund, owner, donor, farmer } = await loadFixture(deployFairFundFixture);

      await fairFund.connect(donor).registerDonor("AidOrg", "Helping");
      await fairFund.connect(farmer).registerFarmer("Ravi", "Village A", "Organic");
      await fairFund.verifyDonor(donor.address);
      await fairFund.verifyFarmer(farmer.address);

      await expect(
        fairFund.connect(donor).createDisbursement(farmer.address, "Seeds", 3, { value: ethers.parseEther("1") })
      ).to.emit(fairFund, "FundsDisbursed");
    });

    it("Should revert if donor is not verified", async function () {
      const { fairFund, donor, farmer } = await loadFixture(deployFairFundFixture);

      await fairFund.connect(donor).registerDonor("AidOrg", "Helping");
      await fairFund.connect(farmer).registerFarmer("Ravi", "Village A", "Organic");

      await expect(
        fairFund.connect(donor).createDisbursement(farmer.address, "Seeds", 3, { value: ethers.parseEther("1") })
      ).to.be.revertedWith("Donor must be verified");
    });
  });

  describe("Claims and Reclaims", function () {
    it("Should allow farmer to claim funds before deadline", async function () {
      const { fairFund, donor, farmer, owner } = await loadFixture(deployFairFundFixture);

      await fairFund.connect(donor).registerDonor("AidOrg", "Helping");
      await fairFund.connect(farmer).registerFarmer("Ravi", "Village A", "Organic");
      await fairFund.verifyDonor(donor.address);
      await fairFund.verifyFarmer(farmer.address);

      await fairFund.connect(donor).createDisbursement(farmer.address, "Seeds", 3, { value: ethers.parseEther("1") });
      await expect(fairFund.connect(farmer).claimFunds(1)).to.emit(fairFund, "FundsClaimed");
    });

    it("Should allow donor to reclaim expired unclaimed funds", async function () {
      const { fairFund, donor, farmer } = await loadFixture(deployFairFundFixture);

      await fairFund.connect(donor).registerDonor("AidOrg", "Helping");
      await fairFund.connect(farmer).registerFarmer("Ravi", "Village A", "Organic");
      await fairFund.verifyDonor(donor.address);
      await fairFund.verifyFarmer(farmer.address);

      await fairFund.connect(donor).createDisbursement(farmer.address, "Tools", 1, { value: ethers.parseEther("1") });

      // Fast-forward time beyond the claim deadline
      await time.increase(2 * 24 * 60 * 60); // 2 days

      await expect(fairFund.connect(donor).reclaimExpiredFunds(1)).to.not.be.reverted;
    });
  });
});
