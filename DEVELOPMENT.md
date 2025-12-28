# 🛠️ Local Development Guide

This guide will help you set up **PonderChain** locally for development and testing.

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **Git**
- **MetaMask** (Browser Extension)
- **Lisk Sepolia ETH** (For Testnet deployment only) - [Faucet](https://lisk.com/faucet)

---

## 📥 Installation

1.  **Fork & Clone the Repository**

    ```bash
    git clone https://github.com/YOUR_USERNAME/ponderchain.git
    cd ponderchain
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

## 🚀 Running Locally (Fastest Way)

We have a helper script `start-dev.js` that automates the local development workflow.

**What it does:**
1.  Starts a local Hardhat Blockchain node.
2.  Deploys the Smart Contracts to the local node.
3.  **Automatically updates** the Frontend and Backend with the new Contract Address.
4.  Starts the Backend API.
5.  Starts the Frontend Application.

**Command:**

```bash
# Run from the root directory
node start-dev.js
```

Once started:
- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend:** [http://localhost:3001](http://localhost:3001)
- **Local Node:** [http://127.0.0.1:8545](http://127.0.0.1:8545)

> **Note:** When using the local Hardhat node, you must import one of the generated "Account" private keys into MetaMask and switch MetaMask to `Localhost 8545`.

---

## 🌐 Running on Testnet (Lisk Sepolia)

If you want to run the frontend locally but interact with the live **Lisk Sepolia Testnet**:

1.  **Deploy Contracts (If not already deployed)**
    ```bash
    cd contracts
    npx hardhat run scripts/deploy.js --network liskSepolia
    ```
    *Copy the deployed address.*

2.  **Update Configuration**
    - Update `VITE_PONDERCHAIN_ADDRESS` in `frontend/.env`.
    - Update `PONDERCHAIN_ADDRESS` in `backend/.env`.

3.  **Start the App**
    ```bash
    # Run from the root directory
    node start-dev.js --testnet
    ```

    *The `--testnet` flag tells the script to skip starting the local Hardhat node and skip auto-deployment.*

---

## 🧪 Running Tests

To run the smart contract test suite:

```bash
cd contracts
npx hardhat test
```
