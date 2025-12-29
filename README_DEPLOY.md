# 🚀 Deployment Guide for VETO

This guide will help you deploy your VETO application to the public web.

## 🏗️ Architecture Overview
Your application consists of three parts:
1.  **Smart Contracts**: Currently on Lisk Sepolia Testnet.
2.  **Backend API**: Node.js/Express server (needs hosting).
3.  **Frontend**: React/Vite app (needs hosting).

---

## 1️⃣ Prerequisites
- A [GitHub](https://github.com) account.
- A [Vercel](https://vercel.com) account (for Frontend).
- A [Render](https://render.com) account (for Backend).
- Your code pushed to a GitHub repository.

---

## 2️⃣ Deploying the Backend (Render)
We will use **Render** to host your Node.js API.

1.  Log in to [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  **Configure the service**:
    -   **Name**: `ponderchain-api`
    -   **Root Directory**: `backend` (Important!)
    -   **Runtime**: Node
    -   **Build Command**: `npm install`
    -   **Start Command**: `node index.js`
5.  **Environment Variables** (Scroll down to "Environment"):
    -   Add `PONDERCHAIN_ADDRESS`: `0xA12EFb16aCFC8879D4fE17c4CF29Ca499fd862F6` (or your latest contract address)
    -   Add `LISK_SEPOLIA_RPC_URL`: `https://rpc.sepolia-api.lisk.com`
6.  Click **Create Web Service**.
7.  Wait for deployment. Once done, copy your **Backend URL** (e.g., `https://ponderchain-api.onrender.com`).

---

## 3️⃣ Deploying the Frontend (Vercel)
We will use **Vercel** to host your React frontend.

1.  Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Configure the project**:
    -   **Framework Preset**: Vite (should auto-detect).
    -   **Root Directory**: Click "Edit" and select `frontend`.
5.  **Environment Variables**:
    -   `VITE_API_URL`: Paste your **Backend URL** from Step 2 (e.g., `https://ponderchain-api.onrender.com/api`).
    -   `VITE_PONDERCHAIN_ADDRESS`: `0xA12EFb16aCFC8879D4fE17c4CF29Ca499fd862F6`
    -   `VITE_PONDERNFT_ADDRESS`: `0x7ce4D31B0e414AF8aD7F81920361cB558312a78a`
6.  Click **Deploy**.

## ✅ Done!
Your site is now live! Users can visit your Vercel URL to interact with VETO.
