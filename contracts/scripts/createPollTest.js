const hre = require("hardhat");

async function main() {
  const contractAddress = "0xA12EFb16aCFC8879D4fE17c4CF29Ca499fd862F6";
  const PonderChain = await hre.ethers.getContractFactory("PonderChain");
  const ponderChain = PonderChain.attach(contractAddress);

  console.log("Creating a test poll...");
  
  const question = "Who is the GOAT?";
  const options = ["Messi", "Ronaldo"];
  const duration = 3600; // 1 hour
  const rewardPool = hre.ethers.parseEther("0.001"); // Small amount

  try {
    const tx = await ponderChain.createPoll(question, options, duration, { value: rewardPool });
    console.log("Transaction sent:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("Poll created! Block:", receipt.blockNumber);
  } catch (error) {
    console.error("Error creating poll:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
