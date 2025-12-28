// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title PonderNFT
 * @dev NFT reward badges for top PonderChain predictors
 */
contract PonderNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Badge types
    enum BadgeType {
        FIRST_PREDICTION,    // First prediction made
        STREAK_3,            // 3 correct predictions in a row
        STREAK_5,            // 5 correct predictions in a row
        STREAK_10,           // 10 correct predictions in a row
        TOP_PREDICTOR,       // Top 10 on leaderboard
        POLL_CREATOR,        // Created first poll
        WHALE_PREDICTOR,     // Predicted with > 1 ETH stake
        CENTURY_CLUB         // 100 total predictions
    }

    struct Badge {
        BadgeType badgeType;
        uint256 mintedAt;
        string metadata;
    }

    // Mappings
    mapping(uint256 => Badge) public badges;
    mapping(address => mapping(BadgeType => bool)) public hasBadge;
    mapping(BadgeType => string) public badgeURIs;

    // Events
    event BadgeMinted(
        address indexed recipient,
        uint256 indexed tokenId,
        BadgeType badgeType
    );

    constructor() ERC721("PonderChain Badge", "PONDER") {
        // Set default badge URIs
        badgeURIs[BadgeType.FIRST_PREDICTION] = "ipfs://QmFirstPrediction";
        badgeURIs[BadgeType.STREAK_3] = "ipfs://QmStreak3";
        badgeURIs[BadgeType.STREAK_5] = "ipfs://QmStreak5";
        badgeURIs[BadgeType.STREAK_10] = "ipfs://QmStreak10";
        badgeURIs[BadgeType.TOP_PREDICTOR] = "ipfs://QmTopPredictor";
        badgeURIs[BadgeType.POLL_CREATOR] = "ipfs://QmPollCreator";
        badgeURIs[BadgeType.WHALE_PREDICTOR] = "ipfs://QmWhalePredictor";
        badgeURIs[BadgeType.CENTURY_CLUB] = "ipfs://QmCenturyClub";
    }

    /**
     * @dev Mint a badge to a user
     */
    function mintBadge(address _recipient, BadgeType _badgeType)
        external
        onlyOwner
        returns (uint256)
    {
        require(!hasBadge[_recipient][_badgeType], "Badge already minted");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(_recipient, newTokenId);
        _setTokenURI(newTokenId, badgeURIs[_badgeType]);

        badges[newTokenId] = Badge({
            badgeType: _badgeType,
            mintedAt: block.timestamp,
            metadata: badgeURIs[_badgeType]
        });

        hasBadge[_recipient][_badgeType] = true;

        emit BadgeMinted(_recipient, newTokenId, _badgeType);

        return newTokenId;
    }

    /**
     * @dev Set badge URI
     */
    function setBadgeURI(BadgeType _badgeType, string memory _uri)
        external
        onlyOwner
    {
        badgeURIs[_badgeType] = _uri;
    }

    /**
     * @dev Get all badges for a user
     */
    function getUserBadges(address _user)
        external
        view
        returns (BadgeType[] memory)
    {
        uint256 count = 0;
        for (uint256 i = 0; i <= uint256(BadgeType.CENTURY_CLUB); i++) {
            if (hasBadge[_user][BadgeType(i)]) {
                count++;
            }
        }

        BadgeType[] memory userBadges = new BadgeType[](count);
        uint256 index = 0;
        for (uint256 i = 0; i <= uint256(BadgeType.CENTURY_CLUB); i++) {
            if (hasBadge[_user][BadgeType(i)]) {
                userBadges[index] = BadgeType(i);
                index++;
            }
        }

        return userBadges;
    }

    // Override required functions
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
