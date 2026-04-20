// lib/abi.ts
export const REPUTATION_NFT_ABI = [
  {
    name: "mintReputation",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "score",          type: "uint256" },
      { name: "commits",        type: "uint256" },
      { name: "prs",            type: "uint256" },
      { name: "issues",         type: "uint256" },
      { name: "githubUsername", type: "string"  },
    ],
    outputs: [],
  },
  {
    name: "getTokenData",
    type: "function",
    stateMutability: "view",
    inputs:  [{ name: "tokenId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "score",          type: "uint256" },
          { name: "commits",        type: "uint256" },
          { name: "prs",            type: "uint256" },
          { name: "issues",         type: "uint256" },
          { name: "githubUsername", type: "string"  },
          { name: "mintedAt",       type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "hasMinted",
    type: "function",
    stateMutability: "view",
    inputs:  [{ name: "address", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "ReputationMinted",
    type: "event",
    inputs: [
      { name: "user",           type: "address", indexed: true  },
      { name: "tokenId",        type: "uint256", indexed: false },
      { name: "score",          type: "uint256", indexed: false },
      { name: "githubUsername", type: "string",  indexed: false },
    ],
  },
] as const;
