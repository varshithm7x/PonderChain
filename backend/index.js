require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { ethers } = require('ethers');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Multer Configuration for File Uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// Blockchain Configuration
const RPC_URL = process.env.LISK_SEPOLIA_RPC_URL || 'https://rpc.sepolia-api.lisk.com';
const CONTRACT_ADDRESS = process.env.VETO_ADDRESS;

// ABI (Simplified for backend needs)
const ABI = [
  "function getPoll(uint256) view returns (tuple(uint256 id, address creator, string question, string[] options, string[] optionImages, uint256 rewardPool, uint256 startTime, uint256 endTime, bool isActive, bool rewardsDistributed, uint256 totalPredictions, uint256 winningOption, uint256[] optionVotes))",
  "function getActivePolls() view returns (tuple(uint256 id, address creator, string question, string[] options, string[] optionImages, uint256 rewardPool, uint256 startTime, uint256 endTime, bool isActive, bool rewardsDistributed, uint256 totalPredictions, uint256 winningOption, uint256[] optionVotes)[])",
  "function getLeaderboard(uint256) view returns (tuple(address user, uint256 correctPredictions, uint256 totalRewards, uint256 streak)[])",
  "function pollCount() view returns (uint256)"
];

// Provider
const provider = new ethers.JsonRpcProvider(RPC_URL);
let contract = null;

if (CONTRACT_ADDRESS) {
  contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
}

// Routes
app.get('/', (req, res) => {
  res.json({
    name: 'PonderChain API',
    version: '1.0.0',
    status: 'active',
    network: 'Lisk Sepolia'
  });
});

// Upload Image to IPFS (Pinata)
app.post('/api/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  const PINATA_API_KEY = process.env.PINATA_API_KEY;
  const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    // Cleanup file
    fs.unlinkSync(req.file.path);
    return res.status(503).json({ error: 'IPFS service not configured (Missing Pinata Keys)' });
  }

  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path));
    
    const metadata = JSON.stringify({
      name: `VETO_POLL_${Date.now()}`,
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      maxBodyLength: 'Infinity',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY
      }
    });

    // Cleanup file
    fs.unlinkSync(req.file.path);

    res.json({ 
      success: true, 
      cid: response.data.IpfsHash,
      url: `https://ipfs.io/ipfs/${response.data.IpfsHash}`
    });

  } catch (error) {
    console.error('IPFS Upload Error:', error);
    // Cleanup file
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Failed to upload image to IPFS' });
  }
});

// Get all active polls
app.get('/api/polls', async (req, res) => {
  if (!contract) return res.status(503).json({ error: 'Contract not configured' });

  try {
    const polls = await contract.getActivePolls();
    const formattedPolls = polls.map(formatPoll);
    res.json(formattedPolls);
  } catch (error) {
    console.error('Error fetching polls:', error);
    res.status(500).json({ error: 'Failed to fetch polls' });
  }
});

// Get specific poll
app.get('/api/polls/:id', async (req, res) => {
  if (!contract) return res.status(503).json({ error: 'Contract not configured' });

  try {
    const poll = await contract.getPoll(req.params.id);
    res.json(formatPoll(poll));
  } catch (error) {
    console.error('Error fetching poll:', error);
    res.status(404).json({ error: 'Poll not found' });
  }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  if (!contract) return res.status(503).json({ error: 'Contract not configured' });

  try {
    const limit = req.query.limit || 20;
    const leaderboard = await contract.getLeaderboard(limit);
    
    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      address: entry.user,
      correctPredictions: Number(entry.correctPredictions),
      totalRewards: ethers.formatEther(entry.totalRewards),
      streak: Number(entry.streak)
    }));

    res.json(formattedLeaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Helper function
function formatPoll(poll) {
  return {
    id: Number(poll.id),
    creator: poll.creator,
    question: poll.question,
    options: [...poll.options],
    optionImages: [...poll.optionImages],
    rewardPool: ethers.formatEther(poll.rewardPool),
    startTime: Number(poll.startTime),
    endTime: Number(poll.endTime),
    isActive: poll.isActive,
    rewardsDistributed: poll.rewardsDistributed,
    totalPredictions: Number(poll.totalPredictions),
    winningOption: Number(poll.winningOption),
    optionVotes: poll.optionVotes.map(Number)
  };
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
