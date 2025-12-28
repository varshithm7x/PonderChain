const hre = require("hardhat");

async function main() {
  const contractAddress = "0xA12EFb16aCFC8879D4fE17c4CF29Ca499fd862F6"; // Deployed PonderChain
  const PonderChain = await hre.ethers.getContractFactory("PonderChain");
  const ponderChain = PonderChain.attach(contractAddress);

  console.log("Checking contract state...");
  
  const feeRecipient = await ponderChain.feeRecipient();
  console.log("Fee Recipient:", feeRecipient);
  
  const minStake = await ponderChain.minStakeAmount();
  console.log("Min Stake:", hre.ethers.formatEther(minStake));

  const paused = await ponderChain.paused();
  console.log("Paused:", paused);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
