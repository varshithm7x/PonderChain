const hre = require("hardhat");

async function main() {
  console.log("🌱 Seeding PonderChain with test data...\n");

  const [deployer, user1, user2, user3] = await hre.ethers.getSigners();

  // Load deployment info
  const fs = require("fs");
  const path = require("path");
  const deploymentPath = path.join(__dirname, `../deployments/${hre.network.name}.json`);
  
  if (!fs.existsSync(deploymentPath)) {
    console.log("❌ Deployment file not found. Run deploy script first.");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const ponderChainAddress = deployment.contracts.PonderChain;

  console.log("📍 PonderChain address:", ponderChainAddress);
  console.log("");

  // Connect to contract
  const PonderChain = await hre.ethers.getContractFactory("PonderChain");
  const ponderChain = PonderChain.attach(ponderChainAddress);

  // Seed Polls
  const polls = [
    {
      question: "Which blockchain will have the highest TVL by end of 2025?",
      options: ["Ethereum", "Solana", "Lisk", "Arbitrum", "Base"],
      duration: 7 * 24 * 60 * 60, // 7 days
      rewardPool: hre.ethers.parseEther("0.1"),
    },
    {
      question: "What will be the price of ETH by March 2025?",
      options: ["Below $3000", "$3000-$4000", "$4000-$5000", "Above $5000"],
      duration: 30 * 24 * 60 * 60, // 30 days
      rewardPool: hre.ethers.parseEther("0.05"),
    },
    {
      question: "Which L2 solution will dominate in 2025?",
      options: ["Lisk", "Optimism", "Arbitrum", "zkSync", "StarkNet"],
      duration: 14 * 24 * 60 * 60, // 14 days
      rewardPool: hre.ethers.parseEther("0.08"),
    },
    {
      question: "Will Bitcoin reach $100K before mid-2025?",
      options: ["Yes, before March", "Yes, March-June", "No, but close", "No, not even close"],
      duration: 3 * 24 * 60 * 60, // 3 days
      rewardPool: hre.ethers.parseEther("0.02"),
    },
    {
      question: "What will be the next major crypto narrative?",
      options: ["AI + Crypto", "DePIN", "RWA Tokenization", "Gaming/Metaverse", "DeSci"],
      duration: 10 * 24 * 60 * 60, // 10 days
      rewardPool: hre.ethers.parseEther("0.06"),
    },
  ];

  console.log("📝 Creating polls...\n");

  for (let i = 0; i < polls.length; i++) {
    const poll = polls[i];
    console.log(`  Creating poll ${i + 1}: "${poll.question.substring(0, 50)}..."`);
    
    try {
      const tx = await ponderChain.createPoll(
        poll.question,
        poll.options,
        poll.duration,
        { value: poll.rewardPool }
      );
      await tx.wait();
      console.log(`  ✅ Poll ${i + 1} created with reward pool: ${hre.ethers.formatEther(poll.rewardPool)} ETH`);
    } catch (error) {
      console.log(`  ❌ Failed to create poll ${i + 1}:`, error.message);
    }
  }

  console.log("\n🎯 Submitting predictions...\n");

  // If we have test accounts, submit some predictions
  if (user1 && user2 && user3) {
    const stakeAmount = hre.ethers.parseEther("0.002");
    
    // User 1 predictions
    try {
      await ponderChain.connect(user1).submitPrediction(1, 2, { value: stakeAmount }); // Lisk
      console.log("  ✅ User1 predicted on Poll 1");
    } catch (e) {
      console.log("  ⚠️ User1 prediction failed:", e.message);
    }

    // User 2 predictions
    try {
      await ponderChain.connect(user2).submitPrediction(1, 0, { value: stakeAmount }); // Ethereum
      console.log("  ✅ User2 predicted on Poll 1");
    } catch (e) {
      console.log("  ⚠️ User2 prediction failed:", e.message);
    }

    // User 3 predictions
    try {
      await ponderChain.connect(user3).submitPrediction(1, 2, { value: stakeAmount }); // Lisk
      console.log("  ✅ User3 predicted on Poll 1");
    } catch (e) {
      console.log("  ⚠️ User3 prediction failed:", e.message);
    }
  }

  // Get poll count
  const pollCount = await ponderChain.pollCount();
  console.log(`\n📊 Total polls created: ${pollCount.toString()}`);

  console.log("\n🎉 Seed data complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });
