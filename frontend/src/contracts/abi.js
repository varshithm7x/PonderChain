// Veto Contract ABI
export const VETO_ABI = [
  // Events
  "event PollCreated(uint256 indexed pollId, address indexed creator, string question, uint256 rewardPool, uint256 endTime)",
  "event PredictionSubmitted(uint256 indexed pollId, address indexed user, uint256 optionIndex, uint256 amount)",
  "event PollClosed(uint256 indexed pollId, uint256 winningOption, uint256 totalParticipants)",
  "event RewardsDistributed(uint256 indexed pollId, uint256 totalRewards, uint256 winnerCount)",
  "event RewardClaimed(uint256 indexed pollId, address indexed user, uint256 amount)",
  "event PlatformFeeCollected(uint256 indexed pollId, uint256 amount)",
  
  // Read Functions
  "function pollCount() view returns (uint256)",
  "function PLATFORM_FEE_PERCENT() view returns (uint256)",
  "function MIN_POLL_DURATION() view returns (uint256)",
  "function MAX_POLL_DURATION() view returns (uint256)",
  "function minStakeAmount() view returns (uint256)",
  "function feeRecipient() view returns (address)",
  "function totalRewardsDistributed() view returns (uint256)",
  
  // Poll View Struct
  `function getPoll(uint256 _pollId) view returns (
    tuple(
      uint256 id,
      address creator,
      string question,
      string[] options,
      uint256 rewardPool,
      uint256 startTime,
      uint256 endTime,
      bool isActive,
      bool rewardsDistributed,
      uint256 totalPredictions,
      uint256 winningOption,
      uint256[] optionVotes
    )
  )`,
  
  // Prediction Struct
  `function getUserPrediction(uint256 _pollId, address _user) view returns (
    tuple(
      uint256 optionIndex,
      uint256 amount,
      bool hasPredicted,
      bool hasClaimedReward
    )
  )`,
  
  // User Stats Struct
  `function getUserStats(address _user) view returns (
    tuple(
      uint256 totalPredictions,
      uint256 correctPredictions,
      uint256 totalRewardsEarned,
      uint256 currentStreak,
      uint256 longestStreak,
      uint256[] participatedPolls
    )
  )`,
  
  // Get Active/Closed Polls
  `function getActivePolls() view returns (
    tuple(
      uint256 id,
      address creator,
      string question,
      string[] options,
      uint256 rewardPool,
      uint256 startTime,
      uint256 endTime,
      bool isActive,
      bool rewardsDistributed,
      uint256 totalPredictions,
      uint256 winningOption,
      uint256[] optionVotes
    )[]
  )`,
  
  `function getClosedPolls() view returns (
    tuple(
      uint256 id,
      address creator,
      string question,
      string[] options,
      uint256 rewardPool,
      uint256 startTime,
      uint256 endTime,
      bool isActive,
      bool rewardsDistributed,
      uint256 totalPredictions,
      uint256 winningOption,
      uint256[] optionVotes
    )[]
  )`,
  
  // Leaderboard
  `function getLeaderboard(uint256 _limit) view returns (
    tuple(
      address user,
      uint256 correctPredictions,
      uint256 totalRewards,
      uint256 streak
    )[]
  )`,
  
  "function getPollParticipants(uint256 _pollId) view returns (address[])",
  
  // Write Functions
  "function createPoll(string memory _question, string[] memory _options, uint256 _duration) payable returns (uint256)",
  "function submitPrediction(uint256 _pollId, uint256 _optionIndex) payable",
  "function closePoll(uint256 _pollId)",
  "function distributeRewards(uint256 _pollId)",
];

// VetoNFT Contract ABI
export const VETONFT_ABI = [
  "function mintBadge(address _recipient, uint8 _badgeType) returns (uint256)",
  "function hasBadge(address, uint8) view returns (bool)",
  "function getUserBadges(address _user) view returns (uint8[])",
  "function badges(uint256) view returns (uint8 badgeType, uint256 mintedAt, string metadata)",
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
];

// Badge Types
export const BADGE_TYPES = {
  FIRST_PREDICTION: 0,
  STREAK_3: 1,
  STREAK_5: 2,
  STREAK_10: 3,
  TOP_PREDICTOR: 4,
  POLL_CREATOR: 5,
  WHALE_PREDICTOR: 6,
  CENTURY_CLUB: 7,
};

export const BADGE_NAMES = {
  0: "First Prediction",
  1: "3 Streak",
  2: "5 Streak",
  3: "10 Streak",
  4: "Top Predictor",
  5: "Poll Creator",
  6: "Whale Predictor",
  7: "Century Club",
};

export const BADGE_DESCRIPTIONS = {
  0: "Made your first prediction",
  1: "3 correct predictions in a row",
  2: "5 correct predictions in a row",
  3: "10 correct predictions in a row",
  4: "Top 10 on the leaderboard",
  5: "Created your first poll",
  6: "Predicted with over 1 ETH stake",
  7: "Made 100 total predictions",
};
