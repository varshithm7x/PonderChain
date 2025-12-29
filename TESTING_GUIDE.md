# 🧪 VETO Testing Checklist & Guide

This document outlines the test plan for VETO and provides instructions on how to run the full application locally for testing.

## 🏗️ Automated Tests

### Smart Contracts
- [x] **Deployment**: Verify owner, fee recipient, and constants are set correctly.
- [x] **Poll Creation**: Verify polls are created with correct parameters and platform fee is deducted.
- [x] **Predictions**: Verify users can submit predictions and stakes are added to the pool.
- [x] **Constraints**: Verify invalid inputs (empty questions, low stake, double voting) are rejected.
- [x] **Closing & Rewards**: Verify polls close on time and rewards are distributed to winners.
- [x] **Leaderboard**: Verify user stats and leaderboard rankings are updated.
- [x] **Admin**: Verify pause/unpause and fee recipient updates work.

Run these tests with:
```bash
cd contracts
npx hardhat test
```

---

## 🖐️ Manual Testing Checklist

### 1. Wallet Connection
- [ ] Connect MetaMask wallet.
- [ ] Verify network switches to Lisk Sepolia (or Localhost).
- [ ] Disconnect wallet.
- [ ] Switch accounts in MetaMask and verify UI updates.

### 2. Poll Creation
- [ ] Navigate to "Create Poll".
- [ ] Try to create a poll without connecting wallet (should prompt connection).
- [ ] Create a poll with valid data (Question, 2+ Options, Duration, Reward).
- [ ] Verify transaction prompt appears in wallet.
- [ ] Confirm transaction and wait for "Poll Created" toast.
- [ ] Verify redirection to the new Poll Page.

### 3. Voting / Prediction
- [ ] Open an active poll.
- [ ] Select an option.
- [ ] Enter a stake amount (>= 0.001 ETH).
- [ ] Click "Submit Prediction".
- [ ] Confirm transaction.
- [ ] Verify UI updates to show "Your Prediction".
- [ ] Try to vote again on the same poll (should be disabled).

### 4. Poll Lifecycle (Localhost Recommended)
- [ ] Create a short duration poll (e.g., 1 hour).
- [ ] Make predictions from multiple accounts (use Incognito windows or multiple browsers).
- [ ] Wait for poll duration to pass (or use Hardhat time manipulation scripts).
- [ ] Verify poll status changes to "Ended".
- [ ] Check "Winning Option" is displayed.

### 5. Rewards
- [ ] As a winner, visit the ended poll page.
- [ ] Click "Claim Reward".
- [ ] Confirm transaction.
- [ ] Verify wallet balance increases.
- [ ] Verify UI shows "Reward Claimed".

### 6. Leaderboard & Profile
- [ ] Visit Leaderboard page.
- [ ] Verify your account is listed with correct stats.
- [ ] Visit Profile page.
- [ ] Check total predictions, earnings, and streaks.

---

## 🚀 How to Run the Full Application Locally

To perform the manual tests, you need to run the blockchain, backend, and frontend simultaneously.

### Step 1: Start Local Blockchain
Open Terminal 1:
```bash
cd contracts
npx hardhat node
```
*Keep this terminal running. It will display 20 test accounts with 10,000 ETH each.*

### Step 2: Deploy Contracts
Open Terminal 2:
```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```
*Copy the `VETO` and `PonderNFT` addresses from the output.*

### Step 3: Configure Frontend
Edit `frontend/.env`:
```bash
VITE_PONDERCHAIN_ADDRESS=0x... (Paste address from Step 2)
VITE_PONDERNFT_ADDRESS=0x... (Paste address from Step 2)
```

### Step 4: Start Backend (Optional)
Open Terminal 3:
```bash
cd backend
# Create .env if missing
echo "PONDERCHAIN_ADDRESS=0x..." > .env 
npm run dev
```

### Step 5: Start Frontend
Open Terminal 4:
```bash
cd frontend
npm run dev
```
Visit `http://localhost:3000` in your browser.

### Step 6: Connect Wallet
- Open MetaMask.
- Add Network "Localhost 8545" (Chain ID: 31337, RPC: http://127.0.0.1:8545).
- Import one of the private keys from Terminal 1 to have ETH for testing.
