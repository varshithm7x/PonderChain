const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting PonderChain deployment...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());
  console.log("");

  // Deploy PonderChain main contract
  console.log("📝 Deploying PonderChain contract...");
  const PonderChain = await hre.ethers.getContractFactory("PonderChain");
  
  // Fee recipient is the deployer, min stake is 0.001 ETH
  const minStakeAmount = hre.ethers.parseEther("0.001");
  const ponderChain = await PonderChain.deploy(deployer.address, minStakeAmount);
  await ponderChain.waitForDeployment();
  
  const ponderChainAddress = await ponderChain.getAddress();
  console.log("✅ PonderChain deployed to:", ponderChainAddress);
  console.log("");

  // Deploy PonderNFT contract
  console.log("🎨 Deploying PonderNFT contract...");
  const PonderNFT = await hre.ethers.getContractFactory("PonderNFT");
  const ponderNFT = await PonderNFT.deploy();
  await ponderNFT.waitForDeployment();
  
  const ponderNFTAddress = await ponderNFT.getAddress();
  console.log("✅ PonderNFT deployed to:", ponderNFTAddress);
  console.log("");

  // Log deployment summary
  console.log("═══════════════════════════════════════════════════════════");
  console.log("                   DEPLOYMENT SUMMARY                       ");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`Network:            ${hre.network.name}`);
  console.log(`Deployer:           ${deployer.address}`);
  console.log(`PonderChain:        ${ponderChainAddress}`);
  console.log(`PonderNFT:          ${ponderNFTAddress}`);
  console.log(`Min Stake:          ${hre.ethers.formatEther(minStakeAmount)} ETH`);
  console.log(`Platform Fee:       2%`);
  console.log("═══════════════════════════════════════════════════════════");
  console.log("");

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    contracts: {
      PonderChain: ponderChainAddress,
      PonderNFT: ponderNFTAddress,
    },
    config: {
      minStakeAmount: minStakeAmount.toString(),
      platformFeePercent: 2,
    },
    timestamp: new Date().toISOString(),
  };

  const fs = require("fs");
  const path = require("path");
  
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log(`📄 Deployment info saved to: deployments/${hre.network.name}.json`);
  console.log("");

  // Verification instructions
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("📋 To verify contracts on Blockscout:");
    console.log(`   npx hardhat verify --network ${hre.network.name} ${ponderChainAddress} "${deployer.address}" "${minStakeAmount}"`);
    console.log(`   npx hardhat verify --network ${hre.network.name} ${ponderNFTAddress}`);
  }

  console.log("\n🎉 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
