// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ReputationNFT is ERC721, Ownable {
    uint256 private _tokenIdCounter;

    struct ReputationData {
        uint256 score;
        uint256 commits;
        uint256 prs;
        uint256 issues;
        string  githubUsername;
        uint256 mintedAt;
    }

    mapping(uint256 => ReputationData) public tokenData;
    mapping(address => bool)           public hasMinted;

    event ReputationMinted(
        address indexed user,
        uint256 tokenId,
        uint256 score,
        string  githubUsername
    );

    constructor() ERC721("GitRep Score", "GREP") Ownable(msg.sender) {}

    function mintReputation(
        uint256 score,
        uint256 commits,
        uint256 prs,
        uint256 issues,
        string calldata githubUsername
    ) external {
        require(!hasMinted[msg.sender], "Already minted");
        require(score > 0, "Score must be > 0");

        uint256 tokenId = _tokenIdCounter++;
        _safeMint(msg.sender, tokenId);

        tokenData[tokenId] = ReputationData({
            score:          score,
            commits:        commits,
            prs:            prs,
            issues:         issues,
            githubUsername: githubUsername,
            mintedAt:       block.timestamp
        });

        hasMinted[msg.sender] = true;
        emit ReputationMinted(msg.sender, tokenId, score, githubUsername);
    }

    function getTokenData(uint256 tokenId)
        external view
        returns (ReputationData memory)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenData[tokenId];
    }
}