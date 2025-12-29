import { create } from 'zustand';
import { ethers } from 'ethers';
import { NETWORKS, DEFAULT_NETWORK, getContractAddress } from '../config';
import { PONDERCHAIN_ABI, PONDERNFT_ABI } from '../contracts/abi';

const useStore = create((set, get) => ({
  // Wallet State
  account: null,
  chainId: null,
  provider: null,
  signer: null,
  isConnecting: false,
  isSwitchingNetwork: false,
  error: null,

  // Contracts
  ponderChainContract: null,
  ponderNFTContract: null,

  // App State
  polls: [],
  activePolls: [],
  closedPolls: [],
  leaderboard: [],
  userStats: null,
  userPredictions: {},
  isLoading: false,

  // Connect Wallet
  connectWallet: async () => {
    let ethereumProvider = window.ethereum;
    
    // Handle multiple wallets (e.g. MetaMask + Coinbase + Phantom)
    if (window.ethereum?.providers?.length) {
      ethereumProvider = window.ethereum.providers.find((p) => p.isMetaMask) || window.ethereum.providers[0];
    }

    if (typeof ethereumProvider === 'undefined') {
      set({ error: 'Please install MetaMask or another Web3 wallet' });
      return false;
    }

    set({ isConnecting: true, error: null });

    try {
      // Request account access
      const accounts = await ethereumProvider.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const provider = new ethers.BrowserProvider(ethereumProvider);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      // Initialize contracts
      const ponderChainAddress = getContractAddress('PonderChain', chainId);
      const ponderNFTAddress = getContractAddress('PonderNFT', chainId);

      let ponderChainContract = null;
      let ponderNFTContract = null;

      if (ponderChainAddress && ponderChainAddress !== '0x0000000000000000000000000000000000000000') {
        ponderChainContract = new ethers.Contract(
          ponderChainAddress,
          PONDERCHAIN_ABI,
          signer
        );
      }

      if (ponderNFTAddress && ponderNFTAddress !== '0x0000000000000000000000000000000000000000') {
        ponderNFTContract = new ethers.Contract(
          ponderNFTAddress,
          PONDERNFT_ABI,
          signer
        );
      }

      set({
        account: accounts[0],
        chainId,
        provider,
        signer,
        ponderChainContract,
        ponderNFTContract,
        isConnecting: false,
      });

      // Setup event listeners
      // Remove existing listeners first to avoid duplicates
      ethereumProvider.removeListener('accountsChanged', get().handleAccountsChanged);
      ethereumProvider.removeListener('chainChanged', get().handleChainChanged);
      
      ethereumProvider.on('accountsChanged', get().handleAccountsChanged);
      ethereumProvider.on('chainChanged', get().handleChainChanged);

      // Clear manual disconnect flag
      localStorage.removeItem('isDisconnected');

      return true;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      set({
        error: error.message || 'Failed to connect wallet',
        isConnecting: false,
      });
      return false;
    }
  },

  // Check if wallet is already connected
  checkConnection: async () => {
    // If user manually disconnected, don't auto-connect
    if (localStorage.getItem('isDisconnected') === 'true') return false;

    let ethereumProvider = window.ethereum;
    
    if (window.ethereum?.providers?.length) {
      ethereumProvider = window.ethereum.providers.find((p) => p.isMetaMask) || window.ethereum.providers[0];
    }

    if (typeof ethereumProvider === 'undefined') return false;

    try {
      const accounts = await ethereumProvider.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        return get().connectWallet();
      }
    } catch (error) {
      console.error('Failed to check connection:', error);
    }
    return false;
  },

  // Disconnect Wallet
  disconnectWallet: async () => {
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', get().handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', get().handleChainChanged);

      try {
        await window.ethereum.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }]
        });
      } catch (e) {
        console.error("Failed to revoke permissions", e);
      }
    }

    // Set manual disconnect flag
    localStorage.setItem('isDisconnected', 'true');

    set({
      account: null,
      chainId: null,
      provider: null,
      signer: null,
      ponderChainContract: null,
      ponderNFTContract: null,
      userStats: null,
      userPredictions: {},
    });
  },

  // Handle account changes
  handleAccountsChanged: (accounts) => {
    if (accounts.length === 0) {
      get().disconnectWallet();
    } else if (accounts[0] !== get().account) {
      get().connectWallet();
    }
  },

  // Handle chain changes
  handleChainChanged: () => {
    window.location.reload();
  },

  // Switch Network
  switchNetwork: async (targetChainId = DEFAULT_NETWORK.chainId) => {
    if (!window.ethereum) return false;

    const network = Object.values(NETWORKS).find(n => n.chainId === targetChainId);
    if (!network) return false;

    set({ isSwitchingNetwork: true });

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainIdHex }],
      });
      set({ isSwitchingNetwork: false });
      return true;
    } catch (switchError) {
      // Chain not added, try to add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: network.chainIdHex,
              chainName: network.name,
              rpcUrls: [network.rpcUrl],
              blockExplorerUrls: network.blockExplorer ? [network.blockExplorer] : [],
              nativeCurrency: network.currency,
            }],
          });
          set({ isSwitchingNetwork: false });
          return true;
        } catch (addError) {
          console.error('Failed to add network:', addError);
          set({ isSwitchingNetwork: false });
          return false;
        }
      }
      console.error('Failed to switch network:', switchError);
      set({ isSwitchingNetwork: false });
      return false;
    }
  },

  // Fetch Active Polls
  fetchActivePolls: async () => {
    const { ponderChainContract } = get();
    if (!ponderChainContract) return;

    set({ isLoading: true });

    try {
      const polls = await ponderChainContract.getActivePolls();
      const formattedPolls = polls.map(formatPoll);
      set({ activePolls: formattedPolls, isLoading: false });
      return formattedPolls;
    } catch (error) {
      console.error('Failed to fetch active polls:', error);
      set({ isLoading: false });
      return [];
    }
  },

  // Fetch Closed Polls
  fetchClosedPolls: async () => {
    const { ponderChainContract } = get();
    if (!ponderChainContract) return;

    set({ isLoading: true });

    try {
      const polls = await ponderChainContract.getClosedPolls();
      const formattedPolls = polls.map(formatPoll);
      set({ closedPolls: formattedPolls, isLoading: false });
      return formattedPolls;
    } catch (error) {
      console.error('Failed to fetch closed polls:', error);
      set({ isLoading: false });
      return [];
    }
  },

  // Fetch Single Poll
  fetchPoll: async (pollId) => {
    const { ponderChainContract } = get();
    if (!ponderChainContract) return null;

    try {
      const poll = await ponderChainContract.getPoll(pollId);
      return formatPoll(poll);
    } catch (error) {
      console.error('Failed to fetch poll:', error);
      return null;
    }
  },

  // Fetch User Prediction for a Poll
  fetchUserPrediction: async (pollId) => {
    const { ponderChainContract, account } = get();
    if (!ponderChainContract || !account) return null;

    try {
      const prediction = await ponderChainContract.getUserPrediction(pollId, account);
      const formattedPrediction = {
        optionIndex: Number(prediction.optionIndex),
        amount: ethers.formatEther(prediction.amount),
        hasPredicted: prediction.hasPredicted,
        hasClaimedReward: prediction.hasClaimedReward,
      };

      set(state => ({
        userPredictions: {
          ...state.userPredictions,
          [pollId]: formattedPrediction,
        },
      }));

      return formattedPrediction;
    } catch (error) {
      console.error('Failed to fetch user prediction:', error);
      return null;
    }
  },

  // Fetch User Stats
  fetchUserStats: async (address = null) => {
    const { ponderChainContract, account } = get();
    if (!ponderChainContract) return null;

    const targetAddress = address || account;
    if (!targetAddress) return null;

    try {
      const stats = await ponderChainContract.getUserStats(targetAddress);
      const formattedStats = {
        totalPredictions: Number(stats.totalPredictions),
        correctPredictions: Number(stats.correctPredictions),
        totalRewardsEarned: ethers.formatEther(stats.totalRewardsEarned),
        currentStreak: Number(stats.currentStreak),
        longestStreak: Number(stats.longestStreak),
        participatedPolls: stats.participatedPolls.map(Number),
        accuracy: stats.totalPredictions > 0
          ? ((Number(stats.correctPredictions) / Number(stats.totalPredictions)) * 100).toFixed(1)
          : 0,
      };

      if (!address || address === account) {
        set({ userStats: formattedStats });
      }

      return formattedStats;
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      return null;
    }
  },

  // Fetch Leaderboard
  fetchLeaderboard: async (limit = 20) => {
    const { ponderChainContract } = get();
    if (!ponderChainContract) return [];

    try {
      const leaderboard = await ponderChainContract.getLeaderboard(limit);
      const formattedLeaderboard = leaderboard.map((entry, index) => ({
        rank: index + 1,
        address: entry.user,
        correctPredictions: Number(entry.correctPredictions),
        totalRewards: ethers.formatEther(entry.totalRewards),
        streak: Number(entry.streak),
      }));

      set({ leaderboard: formattedLeaderboard });
      return formattedLeaderboard;
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      return [];
    }
  },

  // Create Poll
  createPoll: async (question, options, durationInSeconds, rewardPoolInEth) => {
    const { ponderChainContract } = get();
    if (!ponderChainContract) throw new Error('Contract not initialized');

    // Manual gas limit to bypass estimateGas issues on L2s
    const tx = await ponderChainContract.createPoll(
      question,
      options,
      durationInSeconds,
      { 
        value: ethers.parseEther(rewardPoolInEth),
        gasLimit: 1000000 // Explicit gas limit
      }
    );

    const receipt = await tx.wait();
    
    // Find PollCreated event
    const event = receipt.logs.find(log => {
      try {
        const parsed = ponderChainContract.interface.parseLog(log);
        return parsed.name === 'PollCreated';
      } catch {
        return false;
      }
    });

    if (event) {
      const parsed = ponderChainContract.interface.parseLog(event);
      return Number(parsed.args.pollId);
    }

    return null;
  },

  // Submit Prediction
  submitPrediction: async (pollId, optionIndex, stakeAmountInEth) => {
    const { ponderChainContract } = get();
    if (!ponderChainContract) throw new Error('Contract not initialized');

    const tx = await ponderChainContract.submitPrediction(
      pollId,
      optionIndex,
      { value: ethers.parseEther(stakeAmountInEth) }
    );

    await tx.wait();
    return true;
  },

  // Close Poll
  closePoll: async (pollId) => {
    const { ponderChainContract } = get();
    if (!ponderChainContract) throw new Error('Contract not initialized');

    const tx = await ponderChainContract.closePoll(pollId);
    await tx.wait();
    return true;
  },

  // Distribute Rewards
  distributeRewards: async (pollId) => {
    const { ponderChainContract } = get();
    if (!ponderChainContract) throw new Error('Contract not initialized');

    const tx = await ponderChainContract.distributeRewards(pollId);
    await tx.wait();
    return true;
  },
}));

// Helper function to format poll data
function formatPoll(poll) {
  return {
    id: Number(poll.id),
    creator: poll.creator,
    question: poll.question,
    options: [...poll.options],
    rewardPool: ethers.formatEther(poll.rewardPool),
    startTime: Number(poll.startTime) * 1000, // Convert to milliseconds
    endTime: Number(poll.endTime) * 1000,
    isActive: poll.isActive,
    rewardsDistributed: poll.rewardsDistributed,
    totalPredictions: Number(poll.totalPredictions),
    winningOption: Number(poll.winningOption),
    optionVotes: poll.optionVotes.map(Number),
    timeRemaining: Math.max(0, Number(poll.endTime) * 1000 - Date.now()),
  };
}

export default useStore;
