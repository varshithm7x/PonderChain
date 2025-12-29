const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Veto", function () {
  async function deployVetoFixture() {
    const [owner, feeRecipient, user1, user2, user3] = await ethers.getSigners();
    
    const minStakeAmount = ethers.parseEther("0.001");
    const Veto = await ethers.getContractFactory("Veto");
    const veto = await Veto.deploy(feeRecipient.address, minStakeAmount);

    return { veto, owner, feeRecipient, user1, user2, user3, minStakeAmount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { veto, owner } = await loadFixture(deployVetoFixture);
      expect(await veto.owner()).to.equal(owner.address);
    });

    it("Should set the correct fee recipient", async function () {
      const { veto, feeRecipient } = await loadFixture(deployVetoFixture);
      expect(await veto.feeRecipient()).to.equal(feeRecipient.address);
    });

    it("Should set the correct minimum stake amount", async function () {
      const { veto, minStakeAmount } = await loadFixture(deployVetoFixture);
      expect(await veto.minStakeAmount()).to.equal(minStakeAmount);
    });

    it("Should have 2% platform fee", async function () {
      const { veto } = await loadFixture(deployVetoFixture);
      expect(await veto.PLATFORM_FEE_PERCENT()).to.equal(2);
    });
  });

  describe("Poll Creation", function () {
    it("Should create a poll with correct parameters", async function () {
      const { veto, owner } = await loadFixture(deployVetoFixture);
      
      const question = "What is the best blockchain?";
      const options = ["Lisk", "Ethereum", "Solana"];
      const duration = 7 * 24 * 60 * 60; // 7 days
      const rewardPool = ethers.parseEther("1.0");

      await expect(
        veto.createPoll(question, options, duration, { value: rewardPool })
      ).to.emit(veto, "PollCreated");

      const poll = await veto.getPoll(1);
      expect(poll.question).to.equal(question);
      expect(poll.options.length).to.equal(3);
      expect(poll.isActive).to.be.true;
    });

    it("Should deduct 2% platform fee", async function () {
      const { veto, feeRecipient } = await loadFixture(deployVetoFixture);
      
      const rewardPool = ethers.parseEther("1.0");
      const expectedFee = rewardPool * 2n / 100n;
      const expectedActualPool = rewardPool - expectedFee;

      const feeRecipientBalanceBefore = await ethers.provider.getBalance(feeRecipient.address);
      
      await veto.createPoll("Test?", ["A", "B"], 3600, { value: rewardPool });
      
      const feeRecipientBalanceAfter = await ethers.provider.getBalance(feeRecipient.address);
      expect(feeRecipientBalanceAfter - feeRecipientBalanceBefore).to.equal(expectedFee);

      const poll = await veto.getPoll(1);
      expect(poll.rewardPool).to.equal(expectedActualPool);
    });

    it("Should reject empty question", async function () {
      const { veto } = await loadFixture(deployVetoFixture);
      
      await expect(
        veto.createPoll("", ["A", "B"], 3600, { value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("Question cannot be empty");
    });

    it("Should reject less than 2 options", async function () {
      const { veto } = await loadFixture(deployVetoFixture);
      
      await expect(
        veto.createPoll("Test?", ["A"], 3600, { value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("Invalid number of options");
    });

    it("Should reject zero reward pool", async function () {
      const { veto } = await loadFixture(deployVetoFixture);
      
      await expect(
        veto.createPoll("Test?", ["A", "B"], 3600, { value: 0 })
      ).to.be.revertedWith("Reward pool must be greater than 0");
    });
  });

  describe("Predictions", function () {
    it("Should allow users to submit predictions", async function () {
      const { veto, user1 } = await loadFixture(deployVetoFixture);
      
      await veto.createPoll("Test?", ["A", "B"], 3600, { value: ethers.parseEther("0.1") });
      
      const stakeAmount = ethers.parseEther("0.01");
      await expect(
        veto.connect(user1).submitPrediction(1, 0, { value: stakeAmount })
      ).to.emit(veto, "PredictionSubmitted");

      const prediction = await veto.getUserPrediction(1, user1.address);
      expect(prediction.optionIndex).to.equal(0);
      expect(prediction.hasPredicted).to.be.true;
    });

    it("Should reject prediction with insufficient stake", async function () {
      const { veto, user1 } = await loadFixture(deployVetoFixture);
      
      await veto.createPoll("Test?", ["A", "B"], 3600, { value: ethers.parseEther("0.1") });
      
      await expect(
        veto.connect(user1).submitPrediction(1, 0, { value: ethers.parseEther("0.0001") })
      ).to.be.revertedWith("Stake amount too low");
    });

    it("Should reject double prediction", async function () {
      const { veto, user1 } = await loadFixture(deployVetoFixture);
      
      await veto.createPoll("Test?", ["A", "B"], 3600, { value: ethers.parseEther("0.1") });
      
      const stakeAmount = ethers.parseEther("0.01");
      await veto.connect(user1).submitPrediction(1, 0, { value: stakeAmount });
      
      await expect(
        veto.connect(user1).submitPrediction(1, 1, { value: stakeAmount })
      ).to.be.revertedWith("Already predicted");
    });

    it("Should add stake to reward pool", async function () {
      const { veto, user1 } = await loadFixture(deployVetoFixture);
      
      const initialPool = ethers.parseEther("0.1");
      await veto.createPoll("Test?", ["A", "B"], 3600, { value: initialPool });
      
      const pollBefore = await veto.getPoll(1);
      const stakeAmount = ethers.parseEther("0.01");
      
      await veto.connect(user1).submitPrediction(1, 0, { value: stakeAmount });
      
      const pollAfter = await veto.getPoll(1);
      expect(pollAfter.rewardPool).to.equal(pollBefore.rewardPool + stakeAmount);
    });
  });

  describe("Poll Closing & Rewards", function () {
    it("Should close poll after end time", async function () {
      const { veto, user1, user2 } = await loadFixture(deployVetoFixture);
      
      await veto.createPoll("Test?", ["A", "B"], 3600, { value: ethers.parseEther("0.1") });
      
      // Submit predictions
      await veto.connect(user1).submitPrediction(1, 0, { value: ethers.parseEther("0.01") });
      await veto.connect(user2).submitPrediction(1, 0, { value: ethers.parseEther("0.01") });
      
      // Fast forward time
      await time.increase(3601);
      
      await expect(veto.closePoll(1)).to.emit(veto, "PollClosed");
      
      const poll = await veto.getPoll(1);
      expect(poll.isActive).to.be.false;
      expect(poll.winningOption).to.equal(0);
    });

    it("Should distribute rewards to winners", async function () {
      const { veto, user1, user2, user3 } = await loadFixture(deployVetoFixture);
      
      await veto.createPoll("Test?", ["A", "B"], 3600, { value: ethers.parseEther("0.1") });
      
      // User1 and User2 vote for A, User3 votes for B
      await veto.connect(user1).submitPrediction(1, 0, { value: ethers.parseEther("0.01") });
      await veto.connect(user2).submitPrediction(1, 0, { value: ethers.parseEther("0.01") });
      await veto.connect(user3).submitPrediction(1, 1, { value: ethers.parseEther("0.01") });
      
      // Fast forward and close
      await time.increase(3601);
      await veto.closePoll(1);
      
      const user1BalanceBefore = await ethers.provider.getBalance(user1.address);
      
      await expect(veto.distributeRewards(1)).to.emit(veto, "RewardsDistributed");
      
      const user1BalanceAfter = await ethers.provider.getBalance(user1.address);
      expect(user1BalanceAfter).to.be.gt(user1BalanceBefore);
    });

    it("Should update user stats correctly", async function () {
      const { veto, user1, user2 } = await loadFixture(deployVetoFixture);
      
      await veto.createPoll("Test?", ["A", "B"], 3600, { value: ethers.parseEther("0.1") });
      
      await veto.connect(user1).submitPrediction(1, 0, { value: ethers.parseEther("0.01") });
      await veto.connect(user2).submitPrediction(1, 0, { value: ethers.parseEther("0.01") });
      
      await time.increase(3601);
      await veto.closePoll(1);
      await veto.distributeRewards(1);
      
      const stats = await veto.getUserStats(user1.address);
      expect(stats.totalPredictions).to.equal(1);
      expect(stats.correctPredictions).to.equal(1);
      expect(stats.currentStreak).to.equal(1);
    });
  });

  describe("Leaderboard", function () {
    it("Should return correct leaderboard", async function () {
      const { veto, user1, user2 } = await loadFixture(deployVetoFixture);
      
      // Create and participate in poll
      await veto.createPoll("Test?", ["A", "B"], 3600, { value: ethers.parseEther("0.1") });
      await veto.connect(user1).submitPrediction(1, 0, { value: ethers.parseEther("0.01") });
      await veto.connect(user2).submitPrediction(1, 0, { value: ethers.parseEther("0.01") });
      
      await time.increase(3601);
      await veto.closePoll(1);
      await veto.distributeRewards(1);
      
      const leaderboard = await veto.getLeaderboard(10);
      expect(leaderboard.length).to.be.gt(0);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to change fee recipient", async function () {
      const { veto, owner, user1 } = await loadFixture(deployVetoFixture);
      
      await veto.connect(owner).setFeeRecipient(user1.address);
      expect(await veto.feeRecipient()).to.equal(user1.address);
    });

    it("Should allow owner to pause/unpause", async function () {
      const { veto, owner } = await loadFixture(deployVetoFixture);
      
      await veto.connect(owner).pause();
      
      await expect(
        veto.createPoll("Test?", ["A", "B"], 3600, { value: ethers.parseEther("0.1") })
      ).to.be.reverted;
      
      await veto.connect(owner).unpause();
      
      await expect(
        veto.createPoll("Test?", ["A", "B"], 3600, { value: ethers.parseEther("0.1") })
      ).to.emit(veto, "PollCreated");
    });
  });
});
