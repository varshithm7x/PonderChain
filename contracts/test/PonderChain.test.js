const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("PonderChain", function () {
  async function deployPonderChainFixture() {
    const [owner, feeRecipient, user1, user2, user3] = await ethers.getSigners();
    
    const minStakeAmount = ethers.parseEther("0.001");
    const PonderChain = await ethers.getContractFactory("PonderChain");
    const ponderChain = await PonderChain.deploy(feeRecipient.address, minStakeAmount);

    return { ponderChain, owner, feeRecipient, user1, user2, user3, minStakeAmount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { ponderChain, owner } = await loadFixture(deployPonderChainFixture);
      expect(await ponderChain.owner()).to.equal(owner.address);
    });

    it("Should set the correct fee recipient", async function () {
      const { ponderChain, feeRecipient } = await loadFixture(deployPonderChainFixture);
      expect(await ponderChain.feeRecipient()).to.equal(feeRecipient.address);
    });

    it("Should set the correct minimum stake amount", async function () {
      const { ponderChain, minStakeAmount } = await loadFixture(deployPonderChainFixture);
      expect(await ponderChain.minStakeAmount()).to.equal(minStakeAmount);
    });

    it("Should have 2% platform fee", async function () {
      const { ponderChain } = await loadFixture(deployPonderChainFixture);
      expect(await ponderChain.PLATFORM_FEE_PERCENT()).to.equal(2);
    });
  });

  describe("Poll Creation", function () {
    it("Should create a poll with correct parameters", async function () {
      const { ponderChain, owner } = await loadFixture(deployPonderChainFixture);
      
      const question = "What is the best blockchain?";
      const options = ["Lisk", "Ethereum", "Solana"];
      const duration = 7 * 24 * 60 * 60; // 7 days
      const rewardPool = ethers.parseEther("1.0");

      await expect(
        ponderChain.createPoll(question, options, duration, { value: rewardPool })
      ).to.emit(ponderChain, "PollCreated");

      const poll = await ponderChain.getPoll(1);
      expect(poll.question).to.equal(question);
      expect(poll.options.length).to.equal(3);
      expect(poll.isActive).to.be.true;
    });

    it("Should deduct 2% platform fee", async function () {
      const { ponderChain, feeRecipient } = await loadFixture(deployPonderChainFixture);
      
      const rewardPool = ethers.parseEther("1.0");
      const expectedFee = rewardPool * 2n / 100n;
      const expectedActualPool = rewardPool - expectedFee;

      const feeRecipientBalanceBefore = await ethers.provider.getBalance(feeRecipient.address);
      
      await ponderChain.createPoll("Test?", ["A", "B"], 3600, { value: rewardPool });
      
      const feeRecipientBalanceAfter = await ethers.provider.getBalance(feeRecipient.address);
      expect(feeRecipientBalanceAfter - feeRecipientBalanceBefore).to.equal(expectedFee);

      const poll = await ponderChain.getPoll(1);
      expect(poll.rewardPool).to.equal(expectedActualPool);
    });

    it("Should reject empty question", async function () {
      const { ponderChain } = await loadFixture(deployPonderChainFixture);
      
      await expect(
        ponderChain.createPoll("", ["A", "B"], 3600, { value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("Question cannot be empty");
    });

    it("Should reject less than 2 options", async function () {
      const { ponderChain } = await loadFixture(deployPonderChainFixture);
      
      await expect(
        ponderChain.createPoll("Test?", ["A"], 3600, { value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("Invalid number of options");
    });

    it("Should reject zero reward pool", async function () {
      const { ponderChain } = await loadFixture(deployPonderChainFixture);
      
      await expect(
        ponderChain.createPoll("Test?", ["A", "B"], 3600, { value: 0 })
      ).to.be.revertedWith("Reward pool must be greater than 0");
    });
  });

  describe("Predictions", function () {
    it("Should allow users to submit predictions", async function () {
      const { ponderChain, user1 } = await loadFixture(deployPonderChainFixture);
      
      await ponderChain.createPoll("Test?", ["A", "B"], 3600, { value: ethers.parseEther("0.1") });
      
      const stakeAmount = ethers.parseEther("0.01");
      await expect(
        ponderChain.connect(user1).submitPrediction(1, 0, { value: stakeAmount })
      ).to.emit(ponderChain, "PredictionSubmitted");

      const prediction = await ponderChain.getUserPrediction(1, user1.address);
      expect(prediction.optionIndex).to.equal(0);
      expect(prediction.hasPredicted).to.be.true;
    });

    it("Should reject prediction with insufficient stake", async function () {
      const { ponderChain, user1 } = await loadFixture(deployPonderChainFixture);
      
      await ponderChain.createPoll("Test?", ["A", "B"], 3600, { value: ethers.parseEther("0.1") });
      
      await expect(
        ponderChain.connect(user1).submitPrediction(1, 0, { value: ethers.parseEther("0.0001") })
      ).to.be.revertedWith("Stake amount too low");
    });

    it("Should reject double prediction", async function () {
      const { ponderChain, user1 } = await loadFixture(deployPonderChainFixture);
      
      await ponderChain.createPoll("Test?", ["A", "B"], 3600, { value: ethers.parseEther("0.1") });
      
      const stakeAmount = ethers.parseEther("0.01");
      await ponderChain.connect(user1).submitPrediction(1, 0, { value: stakeAmount });
      
      await expect(
        ponderChain.connect(user1).submitPrediction(1, 1, { value: stakeAmount })
      ).to.be.revertedWith("Already predicted");
    });

    it("Should add stake to reward pool", async function () {
      const { ponderChain, user1 } = await loadFixture(deployPonderChainFixture);
      
      const initialPool = ethers.parseEther("0.1");
      await ponderChain.createPoll("Test?", ["A", "B"], 3600, { value: initialPool });
      
      const pollBefore = await ponderChain.getPoll(1);
      const stakeAmount = ethers.parseEther("0.01");
      
      await ponderChain.connect(user1).submitPrediction(1, 0, { value: stakeAmount });
      
      const pollAfter = await ponderChain.getPoll(1);
      expect(pollAfter.rewardPool).to.equal(pollBefore.rewardPool + stakeAmount);
    });
  });

  describe("Poll Closing & Rewards", function () {
    it("Should close poll after end time", async function () {
      const { ponderChain, user1, user2 } = await loadFixture(deployPonderChainFixture);
      
      await ponderChain.createPoll("Test?", ["A", "B"], 3600, { value: ethers.parseEther("0.1") });
      
      // Submit predictions
      await ponderChain.connect(user1).submitPrediction(1, 0, { value: ethers.parseEther("0.01") });
      await ponderChain.connect(user2).submitPrediction(1, 0, { value: ethers.parseEther("0.01") });
      
      // Fast forward time
      await time.increase(3601);
      
      await expect(ponderChain.closePoll(1)).to.emit(ponderChain, "PollClosed");
      
      const poll = await ponderChain.getPoll(1);
      expect(poll.isActive).to.be.false;
      expect(poll.winningOption).to.equal(0);
    });

    it("Should distribute rewards to winners", async function () {
      const { ponderChain, user1, user2, user3 } = await loadFixture(deployPonderChainFixture);
      
      await ponderChain.createPoll("Test?", ["A", "B"], 3600, { value: ethers.parseEther("0.1") });
      
      // User1 and User2 vote for A, User3 votes for B
      await ponderChain.connect(user1).submitPrediction(1, 0, { value: ethers.parseEther("0.01") });
      await ponderChain.connect(user2).submitPrediction(1, 0, { value: ethers.parseEther("0.01") });
      await ponderChain.connect(user3).submitPrediction(1, 1, { value: ethers.parseEther("0.01") });
      
      // Fast forward and close
      await time.increase(3601);
      await ponderChain.closePoll(1);
      
      const user1BalanceBefore = await ethers.provider.getBalance(user1.address);
      
      await expect(ponderChain.distributeRewards(1)).to.emit(ponderChain, "RewardsDistributed");
      
      const user1BalanceAfter = await ethers.provider.getBalance(user1.address);
      expect(user1BalanceAfter).to.be.gt(user1BalanceBefore);
    });

    it("Should update user stats correctly", async function () {
      const { ponderChain, user1, user2 } = await loadFixture(deployPonderChainFixture);
      
      await ponderChain.createPoll("Test?", ["A", "B"], 3600, { value: ethers.parseEther("0.1") });
      
      await ponderChain.connect(user1).submitPrediction(1, 0, { value: ethers.parseEther("0.01") });
      await ponderChain.connect(user2).submitPrediction(1, 0, { value: ethers.parseEther("0.01") });
      
      await time.increase(3601);
      await ponderChain.closePoll(1);
      await ponderChain.distributeRewards(1);
      
      const stats = await ponderChain.getUserStats(user1.address);
      expect(stats.totalPredictions).to.equal(1);
      expect(stats.correctPredictions).to.equal(1);
      expect(stats.currentStreak).to.equal(1);
    });
  });

  describe("Leaderboard", function () {
    it("Should return correct leaderboard", async function () {
      const { ponderChain, user1, user2 } = await loadFixture(deployPonderChainFixture);
      
      // Create and participate in poll
      await ponderChain.createPoll("Test?", ["A", "B"], 3600, { value: ethers.parseEther("0.1") });
      await ponderChain.connect(user1).submitPrediction(1, 0, { value: ethers.parseEther("0.01") });
      await ponderChain.connect(user2).submitPrediction(1, 0, { value: ethers.parseEther("0.01") });
      
      await time.increase(3601);
      await ponderChain.closePoll(1);
      await ponderChain.distributeRewards(1);
      
      const leaderboard = await ponderChain.getLeaderboard(10);
      expect(leaderboard.length).to.be.gt(0);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to change fee recipient", async function () {
      const { ponderChain, owner, user1 } = await loadFixture(deployPonderChainFixture);
      
      await ponderChain.connect(owner).setFeeRecipient(user1.address);
      expect(await ponderChain.feeRecipient()).to.equal(user1.address);
    });

    it("Should allow owner to pause/unpause", async function () {
      const { ponderChain, owner } = await loadFixture(deployPonderChainFixture);
      
      await ponderChain.connect(owner).pause();
      
      await expect(
        ponderChain.createPoll("Test?", ["A", "B"], 3600, { value: ethers.parseEther("0.1") })
      ).to.be.reverted;
      
      await ponderChain.connect(owner).unpause();
      
      await expect(
        ponderChain.createPoll("Test?", ["A", "B"], 3600, { value: ethers.parseEther("0.1") })
      ).to.emit(ponderChain, "PollCreated");
    });
  });
});
