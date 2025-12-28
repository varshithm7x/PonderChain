# 🧠 PonderChain

**Decentralized Predictive Polling Game on Lisk**

PonderChain is a decentralized application (dApp) where users earn rewards by correctly predicting the majority choice on polls. Inspired by the Keynesian Beauty Contest concept, it combines game theory, social prediction, and blockchain incentives.

Built for the **Lisk Hackathon** on Devfolio.

---

## 🌟 Features

- **Predictive Polling:** Users stake ETH to predict the outcome of polls.
- **Majority Wins:** Rewards are distributed to users who voted for the majority option.
- **Game Theory:** It's not just about what you like, but what you think *others* will like.
- **Leaderboard:** Track top predictors, streaks, and total earnings.
- **NFT Badges:** Earn unique NFTs for achievements (First Win, 10 Streak, Whale, etc.).
- **Decentralized:** Fully on-chain logic using Lisk Smart Contracts.

---

## 🏗 Tech Stack

- **Blockchain:** Lisk Sepolia Testnet
- **Smart Contracts:** Solidity, Hardhat
- **Frontend:** React, TailwindCSS, Framer Motion, Ethers.js
- **Backend:** Node.js, Express (Optional API for fast data fetching)
- **Wallet:** MetaMask (Lisk Network Support)

---

## 🚀 Getting Started

For a detailed step-by-step guide on setting up the project locally (including installation, environment variables, and running the local blockchain), please refer to the **[Development Guide](DEVELOPMENT.md)**.

### Quick Start (Local)

1.  **Clone the repo:**
    ```bash
    git clone https://github.com/varshithm7x/PonderChain.git
    cd PonderChain
    ```

2.  **Install dependencies:**
    ```bash
    cd contracts && npm install && cd ..
    cd frontend && npm install && cd ..
    cd backend && npm install && cd ..
    ```

3.  **Run the automated dev script:**
    ```bash
    node start-dev.js
    ```
    This will start the local blockchain, deploy contracts, and launch the full stack.

---

## 💰 Revenue Model

PonderChain implements a sustainable revenue model:

1.  **Platform Fee:** A 2% fee is deducted from every poll's reward pool upon creation. This fee is sent to the admin/treasury wallet to support development and maintenance.
2.  **Sponsored Polls:** Brands can pay to create featured polls to gather market sentiment.
3.  **NFT Minting:** Future premium badges could be mintable for a small fee.

---

## 📜 Smart Contracts

| Contract | Description |
| :--- | :--- |
| `PonderChain.sol` | Main logic for creating polls, voting, and distributing rewards. |
| `PonderNFT.sol` | ERC721 contract for achievement badges. |

**Verified Contract Addresses (Lisk Sepolia):**

- **PonderChain:** `[DEPLOYED_ADDRESS_HERE]`
- **PonderNFT:** `[DEPLOYED_ADDRESS_HERE]`

---

## 🧪 Testing

Run the smart contract test suite:

```bash
cd contracts
npx hardhat test
```

---

## 📸 Screenshots

*(Add screenshots of Home, Poll Page, and Leaderboard here)*

---

## 🔗 Links

- **Live Demo:** [https://ponderchain.vercel.app](https://ponderchain.vercel.app)
- **Demo Video:** [YouTube Link]
- **Pitch Deck:** [Canva/PDF Link]
- **Devfolio Submission:** [Devfolio Link]

---

## 📄 License

This project is licensed under the MIT License.
