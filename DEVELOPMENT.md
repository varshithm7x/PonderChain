# 🛠️ Local Development Guide

This guide will help you set up **PonderChain** locally for development and testing.

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **Git**
- **MetaMask** (Browser Extension)
- **Lisk Sepolia ETH** (For Testnet deployment only) - [Lisk Faucets Directory](https://docs.lisk.com/lisk-tools/faucets/) or [Optimism Superchain Faucet](https://console.optimism.io/faucet)

---

## 📥 Installation

1.  **Fork & Clone the Repository**

    ```bash
    git clone https://github.com/varshithm7x/PonderChain.git
    cd PonderChain
    ```

2.  **Install Dependencies**

    You need to install dependencies for each part of the application:

    ```bash
    # Install Contracts dependencies
    cd contracts
    npm install
    cd ..

    # Install Frontend dependencies
    cd frontend
    npm install
    cd ..

    # Install Backend dependencies
    cd backend
    npm install
    cd ..
    ```

---

## 🔐 Wallet Setup

To interact with the blockchain (deploying contracts or using the app), you need to set up your wallet.

### Option A: Generate a New Wallet (Recommended for Testnet)

We have a script that generates a fresh wallet and automatically saves the private key to your `.env` file.

1.  **Run the generator script:**
    ```bash
    cd contracts
    node scripts/generateWallet.js
    ```
    *Output:*
    ```text
    NEW_ADDRESS=0x...
    NEW_PRIVATE_KEY=0x...
    Updated .env file with new wallet.
    ```

2.  **Import to MetaMask:**
    *   Copy the `NEW_PRIVATE_KEY` from the terminal output.
    *   Open MetaMask > **Account Icon** > **Add account** > **Import account**.
    *   Paste the key.

3.  **Fund your Wallet:**
    *   Copy the `NEW_ADDRESS`.
    *   Go to the [Optimism Superchain Faucet](https://console.optimism.io/faucet) and request funds (Select "Lisk Sepolia").

### Option B: Use Existing Wallet (Testnet)

Use this if you already have a testnet account you want to use.

1.  **Get your Private Key from MetaMask:**
    *   Open MetaMask extension.
    *   Click the three dots menu (⋮) in the top right > **Account Details**.
    *   Click **Show Private Key**.
    *   Enter your password to reveal it and copy the key.

2.  **Update Environment Variables:**
    *   Open `contracts/.env`.
    *   Set `PRIVATE_KEY=your_copied_private_key`.

### Option C: For Local Development

Use this if you are running the blockchain locally on your machine. Hardhat provides pre-funded test accounts.

1.  **Find the Test Private Keys:**
    *   When you run `node start-dev.js`, the terminal will display a list of 20 accounts.
    *   *Alternatively, the default Hardhat Account #0 Private Key is:* `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

2.  **Import to MetaMask:**
    *   Open MetaMask.
    *   Click the **Account Icon** (circle at the top) > **Add account or hardware wallet** > **Import account**.
    *   Paste the Private Key and click **Import**.
    *   *You now have an account with 10,000 ETH on your local chain.*

3.  **Connect MetaMask to Localhost:**
    *   Click the Network dropdown (top left) in MetaMask.
    *   Select **Localhost 8545**.
    *   *If missing:* Settings > Networks > Add Network > Add manually:
        *   **Network Name:** Localhost 8545
        *   **RPC URL:** `http://127.0.0.1:8545`
        *   **Chain ID:** `31337`
        *   **Currency Symbol:** `ETH`

---

## ⚙️ Environment Setup

### 1. Smart Contracts (`/contracts`)

Create a `.env` file in the `contracts` folder:

```bash
cd contracts
cp .env.example .env
```

Edit `.env`:
- `PRIVATE_KEY`: Your wallet private key (Required for Testnet deployment).
- `LISK_SEPOLIA_RPC_URL`: `https://rpc.sepolia-api.lisk.com` (Required for Testnet).

### 2. Backend (`/backend`)

Create a `.env` file in the `backend` folder:

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
- `PONDERCHAIN_ADDRESS`: (Will be set automatically if using `start-dev.js` locally, otherwise set manually).
- `RPC_URL`: `http://127.0.0.1:8545` (Local) or Lisk Sepolia RPC.

### 3. Frontend (`/frontend`)

Create a `.env` file in the `frontend` folder:

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
- `VITE_PONDERCHAIN_ADDRESS`: (Will be set automatically if using `start-dev.js` locally).
- `VITE_API_URL`: `http://localhost:3001` (Local Backend).

---

## 🚀 Running the Application

We have a helper script `start-dev.js` that automates the workflow for both Local and Testnet environments.

### Option 1: Local Development (Full Stack Locally)

Use this to run the Blockchain, Backend, and Frontend all on your machine.

**Command:**
```bash
# Run from the root directory
node start-dev.js
```

**What happens:**
1.  Starts a local Hardhat Node (Blockchain).
2.  Deploys contracts to `localhost`.
3.  **Auto-configures** `.env` files with the new contract addresses.
4.  Starts Backend & Frontend.

**Access:**
- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend:** [http://localhost:3001](http://localhost:3001)
- **Local Node:** [http://127.0.0.1:8545](http://127.0.0.1:8545)

> **Important:** Connect MetaMask to **Localhost 8545** and import a test private key.

---

## 🌐 Option 2: Running on Testnet (Lisk Sepolia)

Use this to run the Frontend/Backend locally but interact with the **Live Lisk Sepolia Testnet**.

### Step 1: Deploy Contracts (One-time setup)
You need to deploy your contracts to the testnet first.

```bash
cd contracts
npx hardhat run scripts/deploy.js --network liskSepolia
```
*This will create a `deployments/liskSepolia.json` file with your contract addresses.*

### Step 2: Start the App
Run the script with the `--testnet` flag.

```bash
# Run from the root directory
node start-dev.js --testnet
```

**What happens:**
1.  Skips starting the local blockchain.
2.  Reads contract addresses from `deployments/liskSepolia.json`.
3.  **Auto-configures** `.env` files.
4.  Starts Backend & Frontend.

> **Important:** Connect MetaMask to **Lisk Sepolia**.

---

## 🧪 Running Tests

To run the smart contract test suite:

```bash
cd contracts
npx hardhat test
```

---

## ❓ Troubleshooting

### Error: `Unable to connect to Localhost`

This error appears in MetaMask when it is set to **Localhost 8545** but your local blockchain node is not running.

**Solution:**
1.  **If using Testnet:** Switch MetaMask network to **Lisk Sepolia**.
2.  **If using Local:** Ensure you have started the environment by running `node start-dev.js` in the root directory.

### Error: `Transaction execution reverted` or `Nonce too high`

This usually happens when switching between Localhost and Testnet, or when restarting the Localhost node (which resets the chain).

**Solution: Reset MetaMask Account**
1.  Open MetaMask.
2.  Go to **Settings** > **Advanced**.
3.  Click **Clear Activity Tab Data** (or "Reset Account").
4.  *This will clear your transaction history (fixing the nonce issue) but will NOT delete your funds or keys.*

### Error: `Contract not found`

Ensure you are connected to the correct network:
- If running `node start-dev.js` (Local), MetaMask must be on **Localhost 8545**.
- If running `node start-dev.js --testnet`, MetaMask must be on **Lisk Sepolia**.

