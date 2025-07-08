const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("JusticeFundSettlement", function () {
  let JusticeFundSettlement;
  let justiceFundSettlement;
  let owner;
  let plaintiff;
  let defendant;
  let addr1;
  let addr2;

  const SETTLEMENT_AMOUNT = ethers.utils.parseEther("1.0");
  const CASE_NUMBER = "JF-2024-001";
  const DESCRIPTION = "Personal injury settlement";
  const KYC_HASH = "0x1234567890abcdef";

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    JusticeFundSettlement = await ethers.getContractFactory("JusticeFundSettlement");
    [owner, plaintiff, defendant, addr1, addr2] = await ethers.getSigners();

    // Deploy the contract
    justiceFundSettlement = await JusticeFundSettlement.deploy();
    await justiceFundSettlement.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await justiceFundSettlement.owner()).to.equal(owner.address);
    });

    it("Should start with zero settlements", async function () {
      expect(await justiceFundSettlement.getTotalSettlements()).to.equal(0);
    });

    it("Should start with zero contract balance", async function () {
      expect(await justiceFundSettlement.getContractBalance()).to.equal(0);
    });
  });

  describe("Participant Verification", function () {
    it("Should allow owner to verify participants", async function () {
      await justiceFundSettlement.verifyParticipant(plaintiff.address, KYC_HASH);
      
      const participant = await justiceFundSettlement.participants(plaintiff.address);
      expect(participant.isVerified).to.be.true;
      expect(participant.isActive).to.be.true;
      expect(participant.kycHash).to.equal(KYC_HASH);
    });

    it("Should emit ParticipantVerified event", async function () {
      await expect(justiceFundSettlement.verifyParticipant(plaintiff.address, KYC_HASH))
        .to.emit(justiceFundSettlement, "ParticipantVerified")
        .withArgs(plaintiff.address, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));
    });

    it("Should not allow non-owner to verify participants", async function () {
      await expect(
        justiceFundSettlement.connect(plaintiff).verifyParticipant(defendant.address, KYC_HASH)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Settlement Creation", function () {
    beforeEach(async function () {
      // Verify both plaintiff and defendant
      await justiceFundSettlement.verifyParticipant(plaintiff.address, KYC_HASH);
      await justiceFundSettlement.verifyParticipant(defendant.address, KYC_HASH);
    });

    it("Should create a settlement successfully", async function () {
      await expect(
        justiceFundSettlement.connect(plaintiff).createSettlement(
          defendant.address,
          SETTLEMENT_AMOUNT,
          CASE_NUMBER,
          DESCRIPTION
        )
      ).to.emit(justiceFundSettlement, "SettlementCreated")
        .withArgs(1, plaintiff.address, defendant.address, SETTLEMENT_AMOUNT, CASE_NUMBER);

      const settlement = await justiceFundSettlement.getSettlement(1);
      expect(settlement.plaintiff).to.equal(plaintiff.address);
      expect(settlement.defendant).to.equal(defendant.address);
      expect(settlement.amount).to.equal(SETTLEMENT_AMOUNT);
      expect(settlement.caseNumber).to.equal(CASE_NUMBER);
      expect(settlement.description).to.equal(DESCRIPTION);
      expect(settlement.status).to.equal(0); // Pending
    });

    it("Should not allow unverified users to create settlements", async function () {
      await expect(
        justiceFundSettlement.connect(addr1).createSettlement(
          defendant.address,
          SETTLEMENT_AMOUNT,
          CASE_NUMBER,
          DESCRIPTION
        )
      ).to.be.revertedWith("Participant not verified");
    });

    it("Should not allow duplicate case numbers", async function () {
      await justiceFundSettlement.connect(plaintiff).createSettlement(
        defendant.address,
        SETTLEMENT_AMOUNT,
        CASE_NUMBER,
        DESCRIPTION
      );

      await expect(
        justiceFundSettlement.connect(plaintiff).createSettlement(
          defendant.address,
          SETTLEMENT_AMOUNT,
          CASE_NUMBER,
          "Another description"
        )
      ).to.be.revertedWith("Case number already used");
    });

    it("Should not allow zero amount settlements", async function () {
      await expect(
        justiceFundSettlement.connect(plaintiff).createSettlement(
          defendant.address,
          0,
          CASE_NUMBER,
          DESCRIPTION
        )
      ).to.be.revertedWith("Settlement amount must be greater than 0");
    });

    it("Should not allow plaintiff and defendant to be the same", async function () {
      await expect(
        justiceFundSettlement.connect(plaintiff).createSettlement(
          plaintiff.address,
          SETTLEMENT_AMOUNT,
          CASE_NUMBER,
          DESCRIPTION
        )
      ).to.be.revertedWith("Plaintiff and defendant cannot be the same");
    });
  });

  describe("Settlement Status Updates", function () {
    beforeEach(async function () {
      await justiceFundSettlement.verifyParticipant(plaintiff.address, KYC_HASH);
      await justiceFundSettlement.verifyParticipant(defendant.address, KYC_HASH);
      
      await justiceFundSettlement.connect(plaintiff).createSettlement(
        defendant.address,
        SETTLEMENT_AMOUNT,
        CASE_NUMBER,
        DESCRIPTION
      );
    });

    it("Should allow owner to update settlement status", async function () {
      await expect(
        justiceFundSettlement.updateSettlementStatus(1, 1) // Approved
      ).to.emit(justiceFundSettlement, "SettlementStatusUpdated")
        .withArgs(1, 0, 1); // Pending to Approved

      const settlement = await justiceFundSettlement.getSettlement(1);
      expect(settlement.status).to.equal(1); // Approved
    });

    it("Should not allow non-owner to update settlement status", async function () {
      await expect(
        justiceFundSettlement.connect(plaintiff).updateSettlementStatus(1, 1)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should not allow updating to the same status", async function () {
      await expect(
        justiceFundSettlement.updateSettlementStatus(1, 0) // Already Pending
      ).to.be.revertedWith("Status is already set to this value");
    });
  });

  describe("Funds Management", function () {
    beforeEach(async function () {
      await justiceFundSettlement.verifyParticipant(plaintiff.address, KYC_HASH);
      await justiceFundSettlement.verifyParticipant(defendant.address, KYC_HASH);
      
      await justiceFundSettlement.connect(plaintiff).createSettlement(
        defendant.address,
        SETTLEMENT_AMOUNT,
        CASE_NUMBER,
        DESCRIPTION
      );
      
      // Approve the settlement
      await justiceFundSettlement.updateSettlementStatus(1, 1); // Approved
    });

    it("Should allow funds deposit for approved settlement", async function () {
      await expect(
        justiceFundSettlement.connect(defendant).depositFunds(1, {
          value: SETTLEMENT_AMOUNT
        })
      ).to.emit(justiceFundSettlement, "FundsDeposited")
        .withArgs(1, defendant.address, SETTLEMENT_AMOUNT);

      const settlement = await justiceFundSettlement.getSettlement(1);
      expect(settlement.fundsDeposited).to.be.true;
      
      const contractBalance = await justiceFundSettlement.getContractBalance();
      expect(contractBalance).to.equal(SETTLEMENT_AMOUNT);
    });

    it("Should not allow funds deposit with incorrect amount", async function () {
      await expect(
        justiceFundSettlement.connect(defendant).depositFunds(1, {
          value: ethers.utils.parseEther("0.5")
        })
      ).to.be.revertedWith("Incorrect deposit amount");
    });

    it("Should allow owner to release funds", async function () {
      // First deposit funds
      await justiceFundSettlement.connect(defendant).depositFunds(1, {
        value: SETTLEMENT_AMOUNT
      });

      const plaintiffBalanceBefore = await plaintiff.getBalance();

      await expect(
        justiceFundSettlement.releaseFunds(1)
      ).to.emit(justiceFundSettlement, "FundsReleased")
        .withArgs(1, plaintiff.address, SETTLEMENT_AMOUNT);

      const plaintiffBalanceAfter = await plaintiff.getBalance();
      expect(plaintiffBalanceAfter.sub(plaintiffBalanceBefore)).to.equal(SETTLEMENT_AMOUNT);

      const settlement = await justiceFundSettlement.getSettlement(1);
      expect(settlement.fundsReleased).to.be.true;
      expect(settlement.status).to.equal(2); // Completed
    });

    it("Should not allow releasing funds without deposit", async function () {
      await expect(
        justiceFundSettlement.releaseFunds(1)
      ).to.be.revertedWith("Funds not deposited");
    });
  });

  describe("Document Management", function () {
    beforeEach(async function () {
      await justiceFundSettlement.verifyParticipant(plaintiff.address, KYC_HASH);
      await justiceFundSettlement.verifyParticipant(defendant.address, KYC_HASH);
      
      await justiceFundSettlement.connect(plaintiff).createSettlement(
        defendant.address,
        SETTLEMENT_AMOUNT,
        CASE_NUMBER,
        DESCRIPTION
      );
    });

    it("Should allow settlement parties to add documents", async function () {
      const documentHash = "0xabcdef1234567890";
      
      await expect(
        justiceFundSettlement.connect(plaintiff).addDocument(1, documentHash)
      ).to.emit(justiceFundSettlement, "DocumentAdded")
        .withArgs(1, documentHash);

      const documents = await justiceFundSettlement.getSettlementDocuments(1);
      expect(documents).to.include(documentHash);
    });

    it("Should not allow non-parties to add documents", async function () {
      const documentHash = "0xabcdef1234567890";
      
      await expect(
        justiceFundSettlement.connect(addr1).addDocument(1, documentHash)
      ).to.be.revertedWith("Not authorized for this settlement");
    });

    it("Should not allow empty document hash", async function () {
      await expect(
        justiceFundSettlement.connect(plaintiff).addDocument(1, "")
      ).to.be.revertedWith("Document hash cannot be empty");
    });
  });

  describe("Pause Functionality", function () {
    beforeEach(async function () {
      await justiceFundSettlement.verifyParticipant(plaintiff.address, KYC_HASH);
      await justiceFundSettlement.verifyParticipant(defendant.address, KYC_HASH);
    });

    it("Should allow owner to pause and unpause", async function () {
      await justiceFundSettlement.pause();
      
      await expect(
        justiceFundSettlement.connect(plaintiff).createSettlement(
          defendant.address,
          SETTLEMENT_AMOUNT,
          CASE_NUMBER,
          DESCRIPTION
        )
      ).to.be.revertedWith("Pausable: paused");

      await justiceFundSettlement.unpause();
      
      await expect(
        justiceFundSettlement.connect(plaintiff).createSettlement(
          defendant.address,
          SETTLEMENT_AMOUNT,
          CASE_NUMBER,
          DESCRIPTION
        )
      ).to.emit(justiceFundSettlement, "SettlementCreated");
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to emergency withdraw", async function () {
      // First, deposit some funds
      await justiceFundSettlement.verifyParticipant(plaintiff.address, KYC_HASH);
      await justiceFundSettlement.verifyParticipant(defendant.address, KYC_HASH);
      
      await justiceFundSettlement.connect(plaintiff).createSettlement(
        defendant.address,
        SETTLEMENT_AMOUNT,
        CASE_NUMBER,
        DESCRIPTION
      );
      
      await justiceFundSettlement.updateSettlementStatus(1, 1); // Approved
      await justiceFundSettlement.connect(defendant).depositFunds(1, {
        value: SETTLEMENT_AMOUNT
      });

      const ownerBalanceBefore = await owner.getBalance();
      
      await justiceFundSettlement.emergencyWithdraw();
      
      const ownerBalanceAfter = await owner.getBalance();
      expect(ownerBalanceAfter.gt(ownerBalanceBefore)).to.be.true;
    });

    it("Should not allow non-owner to emergency withdraw", async function () {
      await expect(
        justiceFundSettlement.connect(plaintiff).emergencyWithdraw()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});