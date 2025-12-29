// Network Configuration for Lisk
export const NETWORKS = {
  liskSepolia: {
    chainId: 4202,
    chainIdHex: '0x106a',
    name: 'Lisk Sepolia Testnet',
    rpcUrl: 'https://rpc.sepolia-api.lisk.com',
    blockExplorer: 'https://sepolia-blockscout.lisk.com',
    currency: {
      name: 'Sepolia ETH',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  localhost: {
    chainId: 31337,
    chainIdHex: '0x7a69',
    name: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: '',
    currency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
  },
};

// Default network
export const DEFAULT_NETWORK = NETWORKS.liskSepolia;

// Contract Addresses (update after deployment)
export const CONTRACT_ADDRESSES = {
  // Lisk Sepolia Testnet
  4202: {
    Veto: import.meta.env.VITE_VETO_ADDRESS_TESTNET || import.meta.env.VITE_VETO_ADDRESS || '0x0000000000000000000000000000000000000000',
    VetoNFT: import.meta.env.VITE_VETONFT_ADDRESS_TESTNET || import.meta.env.VITE_VETONFT_ADDRESS || '0x0000000000000000000000000000000000000000',
  },
  // Localhost
  31337: {
    Veto: import.meta.env.VITE_VETO_ADDRESS_LOCAL || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    VetoNFT: import.meta.env.VITE_VETONFT_ADDRESS_LOCAL || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  },
};

// Get contract address for current network
export const getContractAddress = (contractName, chainId) => {
  const addresses = CONTRACT_ADDRESSES[chainId];
  if (!addresses) {
    console.warn(`No addresses configured for chainId ${chainId}`);
    return null;
  }
  return addresses[contractName];
};

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// App Configuration
export const APP_CONFIG = {
  name: 'VETO',
  description: 'Decentralized Predictive Polling Game on Lisk',
  version: '1.0.0',
  minStakeAmount: '0.001', // in ETH
  platformFee: 2, // percentage
  maxPollDuration: 30 * 24 * 60 * 60, // 30 days in seconds
  minPollDuration: 60 * 60, // 1 hour in seconds
};
