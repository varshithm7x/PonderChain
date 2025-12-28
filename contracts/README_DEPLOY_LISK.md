# 🚀 Deploying to Lisk Sepolia Testnet

To deploy your PonderChain contracts to the Lisk Sepolia Testnet, follow these steps:

## 1. Fund Your Wallet
Your deployment account has **0 ETH** on Lisk Sepolia. You need to obtain testnet tokens.

**Address:** `0x0599858F0dC52cf2769212c42cd2476D6F6bCc36`

1.  Visit the **Lisk Sepolia Faucet**: [https://sepolia-faucet.lisk.com/](https://sepolia-faucet.lisk.com/) (or use the bridge from Sepolia).
2.  Enter the address above.
3.  Claim Lisk Sepolia ETH.

## 2. Deploy Contracts
Once funded, run the following command in your terminal:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network liskSepolia
```

## 3. Verify Contracts
After deployment, the script will print the contract addresses. Use them to verify the contracts on Blockscout.

Replace `PONDERCHAIN_ADDRESS` and `PONDERNFT_ADDRESS` with the actual addresses from the deployment output.

```bash
# Verify PonderChain (Arguments: Owner Address, Min Stake)
npx hardhat verify --network liskSepolia PONDERCHAIN_ADDRESS "0x0599858F0dC52cf2769212c42cd2476D6F6bCc36" "1000000000000000"

# Verify PonderNFT
npx hardhat verify --network liskSepolia PONDERNFT_ADDRESS
```

## 4. Update Frontend
Update your `frontend/.env` file with the new Lisk Sepolia addresses:

```env
VITE_PONDERCHAIN_ADDRESS=0x...
VITE_PONDERNFT_ADDRESS=0x...
```
