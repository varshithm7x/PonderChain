const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting Veto deployment...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());
  console.log("");

  // Deploy Veto main contract
  console.log("📝 Deploying Veto contract...");
  const Veto = await hre.ethers.getContractFactory("Veto");
  
  // Fee recipient is the deployer, min stake is 0.001 ETH
  const minStakeAmount = hre.ethers.parseEther("0.001");
  const veto = await Veto.deploy(deployer.address, minStakeAmount);
  await veto.waitForDeployment();
  
  const vetoAddress = await veto.getAddress();
  console.log("✅ Veto deployed to:", vetoAddress);
  console.log("");

  // Deploy VetoNFT contract
  console.log("🎨 Deploying VetoNFT contract...");
  const VetoNFT = await hre.ethers.getContractFactory("VetoNFT");
  const vetoNFT = await VetoNFT.deploy();
  await vetoNFT.waitForDeployment();
  
  const vetoNFTAddress = await vetoNFT.getAddress();
  console.log("✅ VetoNFT deployed to:", vetoNFTAddress);
  console.log("");

  // Log deployment summary
  console.log("═══════════════════════════════════════════════════════════");
  console.log("                   DEPLOYMENT SUMMARY                       ");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`Network:            ${hre.network.name}`);
  console.log(`Deployer:           ${deployer.address}`);
  console.log(`Veto:               ${vetoAddress}`);
  console.log(`VetoNFT:            ${vetoNFTAddress}`);
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
      Veto: vetoAddress,
      VetoNFT: vetoNFTAddress,
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
    console.log(`   npx hardhat verify --network ${hre.network.name} ${vetoAddress} "${deployer.address}" "${minStakeAmount}"`);
    console.log(`   npx hardhat verify --network ${hre.network.name} ${vetoNFTAddress}`);
  }

  console.log("\n🎉 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
