const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
  const wallet = ethers.Wallet.createRandom();
  console.log("NEW_ADDRESS=" + wallet.address);
  console.log("NEW_PRIVATE_KEY=" + wallet.privateKey);
  
  const envPath = path.join(__dirname, "../.env");
  let envContent = "";
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  }

  // Replace or append PRIVATE_KEY
  if (envContent.includes("PRIVATE_KEY=")) {
    envContent = envContent.replace(/PRIVATE_KEY=.*/g, `PRIVATE_KEY=${wallet.privateKey}`);
  } else {
    envContent += `\nPRIVATE_KEY=${wallet.privateKey}`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log("Updated .env file with new wallet.");
}

main();
