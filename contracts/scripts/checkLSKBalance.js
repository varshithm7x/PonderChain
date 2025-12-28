const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const userAddress = deployer.address;
  const lskTokenAddress = "0x8a21CF9Ba08Ae709D64Cb25AfAA951183EC9FF6D"; // LSK on Lisk Sepolia

  console.log(`Checking balances for account: ${userAddress}`);

  // Check ETH Balance (Gas Token)
  const ethBalance = await hre.ethers.provider.getBalance(userAddress);
  console.log(`ETH Balance (Gas): ${hre.ethers.formatEther(ethBalance)} ETH`);

  // Check LSK Token Balance (ERC20)
  const abi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
  ];
  const lskContract = new hre.ethers.Contract(lskTokenAddress, abi, hre.ethers.provider);

  try {
    const lskBalance = await lskContract.balanceOf(userAddress);
    const decimals = await lskContract.decimals();
    const symbol = await lskContract.symbol();
    console.log(`${symbol} Balance:     ${hre.ethers.formatUnits(lskBalance, decimals)} ${symbol}`);
  } catch (error) {
    console.error("Error fetching LSK balance:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
