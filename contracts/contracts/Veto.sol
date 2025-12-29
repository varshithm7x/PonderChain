// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title Veto
 * @dev A decentralized predictive polling game on Lisk blockchain
 * Users earn rewards by correctly predicting the majority choice
 * Inspired by the Keynesian Beauty Contest concept
 */
contract Veto is Ownable, ReentrancyGuard, Pausable {
    // ============ Constants ============
    uint256 public constant PLATFORM_FEE_PERCENT = 2; // 2% fee from reward pool
    uint256 public constant MIN_POLL_DURATION = 1 hours;
    uint256 public constant MAX_POLL_DURATION = 30 days;
    uint256 public constant MAX_OPTIONS = 10;
    uint256 public constant MIN_OPTIONS = 2;

    // ============ Structs ============
    struct Poll {
        uint256 id;
        address creator;
        string question;
        string[] options;
        uint256 rewardPool;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        bool rewardsDistributed;
        uint256 totalPredictions;
        uint256 winningOption;
        mapping(uint256 => uint256) optionVotes; // optionIndex => vote count
        mapping(address => Prediction) predictions;
        address[] participants;
    }

    struct Prediction {
        uint256 optionIndex;
        uint256 amount;
        bool hasPredicted;
        bool hasClaimedReward;
    }

    struct PollView {
        uint256 id;
        address creator;
        string question;
        string[] options;
        uint256 rewardPool;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        bool rewardsDistributed;
        uint256 totalPredictions;
        uint256 winningOption;
        uint256[] optionVotes;
    }

    struct UserStats {
        uint256 totalPredictions;
        uint256 correctPredictions;
        uint256 totalRewardsEarned;
        uint256 currentStreak;
        uint256 longestStreak;
        uint256[] participatedPolls;
    }

    struct LeaderboardEntry {
        address user;
        uint256 correctPredictions;
        uint256 totalRewards;
        uint256 streak;
    }

    // ============ State Variables ============
    uint256 public pollCount;
    uint256 public totalRewardsDistributed;
    uint256 public platformFeesCollected;
    address public feeRecipient;
    uint256 public minStakeAmount;

    mapping(uint256 => Poll) private polls;
    mapping(address => UserStats) public userStats;
    address[] public allUsers;
    mapping(address => bool) private userExists;

    // ============ Events ============
    event PollCreated(
        uint256 indexed pollId,
        address indexed creator,
        string question,
        uint256 rewardPool,
        uint256 endTime
    );
    event PredictionSubmitted(
        uint256 indexed pollId,
        address indexed user,
        uint256 optionIndex,
        uint256 amount
    );
    event PollClosed(
        uint256 indexed pollId,
        uint256 winningOption,
        uint256 totalParticipants
    );
    event RewardsDistributed(
        uint256 indexed pollId,
        uint256 totalRewards,
        uint256 winnerCount
    );
    event RewardClaimed(
        uint256 indexed pollId,
        address indexed user,
        uint256 amount
    );
    event PlatformFeeCollected(uint256 indexed pollId, uint256 amount);

    // ============ Modifiers ============
    modifier pollExists(uint256 _pollId) {
        require(_pollId > 0 && _pollId <= pollCount, "Poll does not exist");
        _;
    }

    modifier pollIsActive(uint256 _pollId) {
        require(polls[_pollId].isActive, "Poll is not active");
        require(block.timestamp < polls[_pollId].endTime, "Poll has ended");
        _;
    }

    modifier pollHasEnded(uint256 _pollId) {
        require(
            block.timestamp >= polls[_pollId].endTime || !polls[_pollId].isActive,
            "Poll has not ended yet"
        );
        _;
    }

    // ============ Constructor ============
    constructor(address _feeRecipient, uint256 _minStakeAmount) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
        minStakeAmount = _minStakeAmount;
    }

    // ============ Core Functions ============

    /**
     * @dev Create a new poll with reward pool
     * @param _question The poll question
     * @param _options Array of option strings
     * @param _duration Duration of the poll in seconds
     */
    function createPoll(
        string memory _question,
        string[] memory _options,
        uint256 _duration
    ) external payable whenNotPaused nonReentrant returns (uint256) {
        require(bytes(_question).length > 0, "Question cannot be empty");
        require(
            _options.length >= MIN_OPTIONS && _options.length <= MAX_OPTIONS,
            "Invalid number of options"
        );
        require(
            _duration >= MIN_POLL_DURATION && _duration <= MAX_POLL_DURATION,
            "Invalid poll duration"
        );
        require(msg.value > 0, "Reward pool must be greater than 0");

        // Calculate and transfer platform fee
        uint256 platformFee = (msg.value * PLATFORM_FEE_PERCENT) / 100;
        uint256 actualRewardPool = msg.value - platformFee;

        pollCount++;
        Poll storage newPoll = polls[pollCount];
        newPoll.id = pollCount;
        newPoll.creator = msg.sender;
        newPoll.question = _question;
        newPoll.options = _options;
        newPoll.rewardPool = actualRewardPool;
        newPoll.startTime = block.timestamp;
        newPoll.endTime = block.timestamp + _duration;
        newPoll.isActive = true;

        // Transfer platform fee
        if (platformFee > 0) {
            platformFeesCollected += platformFee;
            (bool success, ) = feeRecipient.call{value: platformFee}("");
            require(success, "Fee transfer failed");
            emit PlatformFeeCollected(pollCount, platformFee);
        }

        emit PollCreated(
            pollCount,
            msg.sender,
            _question,
            actualRewardPool,
            newPoll.endTime
        );

        return pollCount;
    }

    /**
     * @dev Submit a prediction for a poll
     * @param _pollId The ID of the poll
     * @param _optionIndex The index of the chosen option
     */
    function submitPrediction(uint256 _pollId, uint256 _optionIndex)
        external
        payable
        whenNotPaused
        nonReentrant
        pollExists(_pollId)
        pollIsActive(_pollId)
    {
        Poll storage poll = polls[_pollId];
        
        require(
            _optionIndex < poll.options.length,
            "Invalid option index"
        );
        require(
            !poll.predictions[msg.sender].hasPredicted,
            "Already predicted"
        );
        require(
            msg.value >= minStakeAmount,
            "Stake amount too low"
        );

        // Add stake to reward pool
        poll.rewardPool += msg.value;

        // Record prediction
        poll.predictions[msg.sender] = Prediction({
            optionIndex: _optionIndex,
            amount: msg.value,
            hasPredicted: true,
            hasClaimedReward: false
        });

        poll.optionVotes[_optionIndex]++;
        poll.totalPredictions++;
        poll.participants.push(msg.sender);

        // Update user stats
        _updateUserParticipation(msg.sender, _pollId);

        emit PredictionSubmitted(_pollId, msg.sender, _optionIndex, msg.value);
    }

    /**
     * @dev Close a poll and determine the winning option
     * @param _pollId The ID of the poll
     */
    function closePoll(uint256 _pollId)
        external
        pollExists(_pollId)
        pollHasEnded(_pollId)
    {
        Poll storage poll = polls[_pollId];
        require(poll.isActive, "Poll already closed");

        poll.isActive = false;

        // Determine winning option (majority vote)
        uint256 maxVotes = 0;
        uint256 winningOptionIndex = 0;

        for (uint256 i = 0; i < poll.options.length; i++) {
            if (poll.optionVotes[i] > maxVotes) {
                maxVotes = poll.optionVotes[i];
                winningOptionIndex = i;
            }
        }

        poll.winningOption = winningOptionIndex;

        emit PollClosed(_pollId, winningOptionIndex, poll.totalPredictions);
    }

    /**
     * @dev Distribute rewards to winners of a poll
     * @param _pollId The ID of the poll
     */
    function distributeRewards(uint256 _pollId)
        external
        nonReentrant
        pollExists(_pollId)
    {
        Poll storage poll = polls[_pollId];
        require(!poll.isActive, "Poll is still active");
        require(!poll.rewardsDistributed, "Rewards already distributed");

        poll.rewardsDistributed = true;

        // Count winners
        uint256 winnerCount = poll.optionVotes[poll.winningOption];
        
        if (winnerCount == 0) {
            // No winners - return funds to creator
            (bool success, ) = poll.creator.call{value: poll.rewardPool}("");
            require(success, "Refund transfer failed");
            return;
        }

        // Calculate reward per winner
        uint256 rewardPerWinner = poll.rewardPool / winnerCount;
        uint256 actuallyDistributed = 0;

        // Distribute to each winner
        for (uint256 i = 0; i < poll.participants.length; i++) {
            address participant = poll.participants[i];
            Prediction storage prediction = poll.predictions[participant];

            if (prediction.optionIndex == poll.winningOption) {
                prediction.hasClaimedReward = true;
                actuallyDistributed += rewardPerWinner;

                // Update user stats
                _updateUserWin(participant, rewardPerWinner);

                (bool success, ) = participant.call{value: rewardPerWinner}("");
                require(success, "Reward transfer failed");

                emit RewardClaimed(_pollId, participant, rewardPerWinner);
            } else {
                // Reset streak for losers
                userStats[participant].currentStreak = 0;
            }
        }

        totalRewardsDistributed += actuallyDistributed;

        emit RewardsDistributed(_pollId, actuallyDistributed, winnerCount);
    }

    // ============ View Functions ============

    /**
     * @dev Get poll details
     */
    function getPoll(uint256 _pollId)
        external
        view
        pollExists(_pollId)
        returns (PollView memory)
    {
        Poll storage poll = polls[_pollId];
        
        uint256[] memory votes = new uint256[](poll.options.length);
        for (uint256 i = 0; i < poll.options.length; i++) {
            votes[i] = poll.optionVotes[i];
        }

        return PollView({
            id: poll.id,
            creator: poll.creator,
            question: poll.question,
            options: poll.options,
            rewardPool: poll.rewardPool,
            startTime: poll.startTime,
            endTime: poll.endTime,
            isActive: poll.isActive,
            rewardsDistributed: poll.rewardsDistributed,
            totalPredictions: poll.totalPredictions,
            winningOption: poll.winningOption,
            optionVotes: votes
        });
    }

    /**
     * @dev Get user's prediction for a poll
     */
    function getUserPrediction(uint256 _pollId, address _user)
        external
        view
        pollExists(_pollId)
        returns (Prediction memory)
    {
        return polls[_pollId].predictions[_user];
    }

    /**
     * @dev Get user statistics
     */
    function getUserStats(address _user)
        external
        view
        returns (UserStats memory)
    {
        return userStats[_user];
    }

    /**
     * @dev Get all active polls
     */
    function getActivePolls() external view returns (PollView[] memory) {
        uint256 activeCount = 0;
        
        for (uint256 i = 1; i <= pollCount; i++) {
            if (polls[i].isActive && block.timestamp < polls[i].endTime) {
                activeCount++;
            }
        }

        PollView[] memory activePolls = new PollView[](activeCount);
        uint256 index = 0;

        for (uint256 i = 1; i <= pollCount; i++) {
            if (polls[i].isActive && block.timestamp < polls[i].endTime) {
                Poll storage poll = polls[i];
                uint256[] memory votes = new uint256[](poll.options.length);
                for (uint256 j = 0; j < poll.options.length; j++) {
                    votes[j] = poll.optionVotes[j];
                }
                activePolls[index] = PollView({
                    id: poll.id,
                    creator: poll.creator,
                    question: poll.question,
                    options: poll.options,
                    rewardPool: poll.rewardPool,
                    startTime: poll.startTime,
                    endTime: poll.endTime,
                    isActive: poll.isActive,
                    rewardsDistributed: poll.rewardsDistributed,
                    totalPredictions: poll.totalPredictions,
                    winningOption: poll.winningOption,
                    optionVotes: votes
                });
                index++;
            }
        }

        return activePolls;
    }

    /**
     * @dev Get closed polls
     */
    function getClosedPolls() external view returns (PollView[] memory) {
        uint256 closedCount = 0;
        
        for (uint256 i = 1; i <= pollCount; i++) {
            if (!polls[i].isActive || block.timestamp >= polls[i].endTime) {
                closedCount++;
            }
        }

        PollView[] memory closedPolls = new PollView[](closedCount);
        uint256 index = 0;

        for (uint256 i = 1; i <= pollCount; i++) {
            if (!polls[i].isActive || block.timestamp >= polls[i].endTime) {
                Poll storage poll = polls[i];
                uint256[] memory votes = new uint256[](poll.options.length);
                for (uint256 j = 0; j < poll.options.length; j++) {
                    votes[j] = poll.optionVotes[j];
                }
                closedPolls[index] = PollView({
                    id: poll.id,
                    creator: poll.creator,
                    question: poll.question,
                    options: poll.options,
                    rewardPool: poll.rewardPool,
                    startTime: poll.startTime,
                    endTime: poll.endTime,
                    isActive: poll.isActive,
                    rewardsDistributed: poll.rewardsDistributed,
                    totalPredictions: poll.totalPredictions,
                    winningOption: poll.winningOption,
                    optionVotes: votes
                });
                index++;
            }
        }

        return closedPolls;
    }

    /**
     * @dev Get leaderboard (top users by correct predictions)
     */
    function getLeaderboard(uint256 _limit)
        external
        view
        returns (LeaderboardEntry[] memory)
    {
        uint256 limit = _limit > allUsers.length ? allUsers.length : _limit;
        LeaderboardEntry[] memory entries = new LeaderboardEntry[](allUsers.length);

        for (uint256 i = 0; i < allUsers.length; i++) {
            address user = allUsers[i];
            entries[i] = LeaderboardEntry({
                user: user,
                correctPredictions: userStats[user].correctPredictions,
                totalRewards: userStats[user].totalRewardsEarned,
                streak: userStats[user].currentStreak
            });
        }

        // Simple bubble sort for leaderboard (fine for small arrays)
        for (uint256 i = 0; i < entries.length; i++) {
            for (uint256 j = i + 1; j < entries.length; j++) {
                if (entries[j].correctPredictions > entries[i].correctPredictions) {
                    LeaderboardEntry memory temp = entries[i];
                    entries[i] = entries[j];
                    entries[j] = temp;
                }
            }
        }

        // Return limited entries
        LeaderboardEntry[] memory result = new LeaderboardEntry[](limit);
        for (uint256 i = 0; i < limit; i++) {
            result[i] = entries[i];
        }

        return result;
    }

    /**
     * @dev Get poll participants
     */
    function getPollParticipants(uint256 _pollId)
        external
        view
        pollExists(_pollId)
        returns (address[] memory)
    {
        return polls[_pollId].participants;
    }

    // ============ Internal Functions ============

    function _updateUserParticipation(address _user, uint256 _pollId) internal {
        if (!userExists[_user]) {
            allUsers.push(_user);
            userExists[_user] = true;
        }
        userStats[_user].totalPredictions++;
        userStats[_user].participatedPolls.push(_pollId);
    }

    function _updateUserWin(address _user, uint256 _reward) internal {
        userStats[_user].correctPredictions++;
        userStats[_user].totalRewardsEarned += _reward;
        userStats[_user].currentStreak++;
        
        if (userStats[_user].currentStreak > userStats[_user].longestStreak) {
            userStats[_user].longestStreak = userStats[_user].currentStreak;
        }
    }

    // ============ Admin Functions ============

    function setFeeRecipient(address _newRecipient) external onlyOwner {
        require(_newRecipient != address(0), "Invalid address");
        feeRecipient = _newRecipient;
    }

    function setMinStakeAmount(uint256 _amount) external onlyOwner {
        minStakeAmount = _amount;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    // ============ Fallback ============

    receive() external payable {}
}
