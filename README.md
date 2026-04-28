# GitRap: GitHub Reputation & NFT Platform

**GitRap** is a decentralized platform that transforms your GitHub contributions into verifiable on-chain reputation NFTs. Earn reputation scores based on your GitHub activity, compete on leaderboards, participate in DAO governance, and mint reputation badges as ERC-721 NFTs.

## 🎯 Project Overview

GitRap bridges the gap between GitHub activity and blockchain identity by:

- **Aggregating GitHub Contributions**: Automatically tracks commits, pull requests, and issues
- **Computing Reputation Scores**: Calculates weighted scores based on contribution metrics
- **Minting Reputation NFTs**: Creates verifiable on-chain badges of your GitHub reputation
- **DAO Governance**: Vote on GitHub issues and participate in decentralized governance
- **Leaderboard Rankings**: Compete with other developers on contribution metrics

## 📋 Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Smart Contracts](#smart-contracts)
- [Environment Variables](#environment-variables)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                   │
│  - Dashboard, Leaderboard, DAO, Mint Pages             │
│  - Web3 Integration, Wallet Connection                  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Backend (Express + TypeScript)             │
│  - GitHub OAuth Flow                                    │
│  - Contribution Aggregation                             │
│  - Reputation Scoring                                   │
│  - DAO Voting Logic                                     │
│  - NFT Metadata Generation                              │
└──────────────────────┬──────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
    PostgreSQL    GitHub API   Smart Contracts
    (Neon)                      (Ethereum/L2)
         │                      (ERC-721 NFT)
         └──────────────────────┘
```

## 💻 Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.1
- **Database**: PostgreSQL (via Neon)
- **ORM**: Prisma
- **Authentication**: GitHub OAuth 2.0, JWT tokens
- **Utilities**: Zod (validation), Helmet (security)

### Frontend
- **Framework**: Next.js 14+
- **UI Library**: React with Radix UI
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form
- **Data Fetching**: TanStack Query
- **Web3**: Wagmi (Ethereum interactions)
- **Animations**: Three.js, Framer Motion

### Smart Contracts
- **Language**: Solidity ^0.8.20
- **Standard**: ERC-721 (NFTs)
- **Dependencies**: OpenZeppelin Contracts

## 📦 Prerequisites

- **Node.js** 18+ and npm/yarn
- **Git**
- **PostgreSQL** database (or Neon account)
- **GitHub OAuth Application** credentials
- **Ethereum wallet** (for Web3 features)
- **Solidity compiler** (for smart contract development)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/gitrap.git
cd gitrap
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment variables (see Environment Variables section)
nano .env

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

The backend will start on `http://localhost:3001` (or configured PORT)

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file (if needed)
cp .env.example .env.local

# Start development server
npm run dev
```

The frontend will start on `http://localhost:3000`

### 4. Smart Contracts (Optional for Local Development)

```bash
cd smart_contracts

# Install dependencies (if using Hardhat)
npm install

# Compile contracts
npx hardhat compile

# Deploy to testnet (if configured)
npx hardhat run scripts/deploy.js --network testnet
```

## 📁 Project Structure

### Backend (`/backend`)

```
src/
├── server.ts                 # Express app initialization
├── middleware/              # Express middlewares
├── routes/                  # API endpoint handlers
│   ├── auth.ts             # GitHub OAuth flow
│   ├── github.ts           # GitHub issue/PR operations
│   ├── dao.ts              # DAO voting endpoints
│   ├── leaderboard.ts      # Leaderboard data
│   ├── score.ts            # Score calculations
│   ├── nft.ts              # NFT metadata
│   └── user.ts             # User profile endpoints
└── lib/                     # Business logic & utilities
    ├── auth.ts             # Authentication helpers
    ├── github.ts           # GitHub API integration
    ├── scoring.ts          # Reputation scoring algorithm
    ├── crypto.ts           # Token encryption/decryption
    ├── validation.ts       # Input validation schemas
    ├── prisma.ts           # Database client
    ├── env.ts              # Environment config
    ├── http.ts             # HTTP request helpers
    └── users.ts            # User data operations
prisma/
└── schema.prisma           # Database schema
```

### Frontend (`/frontend`)

```
app/
├── page.tsx                # Landing page
├── layout.tsx              # Root layout
├── globals.css             # Global styles
├── (dashboard)/            # Protected dashboard routes
│   ├── layout.tsx         # Dashboard layout
│   ├── dao/               # DAO governance page
│   ├── leaderboard/       # Leaderboard page
│   ├── profile/           # User profile page
│   ├── settings/          # Settings page
│   ├── mint/              # NFT minting page
│   └── issues/            # GitHub issues page
├── api/                    # API routes
│   └── auth/              # OAuth callback handlers
└── onboarding/            # Onboarding flow
components/
├── ui/                     # Radix UI components
├── agent-interface.tsx     # AI agent interface
├── live-agent-feed.tsx     # Real-time agent updates
├── stacking-agent-cards.tsx # Card components
└── ...                     # Other custom components
hooks/
├── useWeb3Auth.tsx        # Web3 authentication hook
├── useMintReputation.ts   # NFT minting hook
├── use-toast.ts           # Toast notifications
└── use-mobile.ts          # Mobile detection
lib/
├── api.ts                 # API client
├── wagmi.ts               # Web3 config
├── abi.ts                 # Smart contract ABIs
└── utils.ts               # Utility functions
```

### Smart Contracts (`/smart_contracts`)

```
reputationNFT.sol          # ERC-721 reputation badge contract
```

## 🔌 API Documentation

### Authentication

#### POST `/api/auth/github`

Authenticates a user with GitHub and links their wallet.

**Request:**
```json
{
  "code": "github-oauth-code",
  "walletAddress": "0x123abc..."
}
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "user-id",
    "githubUsername": "octocat",
    "walletAddress": "0x123abc...",
    "score": 850,
    "level": "advanced"
  }
}
```

### GitHub Integration

#### GET `/api/github/user`

Get the authenticated user's GitHub profile and contribution stats.

**Response:**
```json
{
  "username": "octocat",
  "avatar": "https://...",
  "bio": "GitHub's mascot",
  "commits": 1250,
  "prs": 342,
  "issues": 156,
  "followers": 3500
}
```

#### POST `/api/github/issues`

Create a GitHub issue linked to DAO governance.

**Request:**
```json
{
  "owner": "username",
  "repo": "repo-name",
  "title": "Issue title",
  "body": "Issue description"
}
```

### DAO Governance

#### GET `/api/dao/votes`

Get all DAO votes and voting status.

**Response:**
```json
{
  "votes": [
    {
      "id": "vote-1",
      "issueId": "12345",
      "title": "Should we add feature X?",
      "yes": 45,
      "no": 12,
      "userVote": "yes",
      "deadline": "2026-05-28T00:00:00Z"
    }
  ]
}
```

#### POST `/api/dao/votes`

Cast a vote on a GitHub issue.

**Request:**
```json
{
  "voteId": "vote-1",
  "choice": "yes"
}
```

### Leaderboard

#### GET `/api/leaderboard`

Get ranked list of users by reputation score.

**Query Parameters:**
- `limit`: Number of users (default: 100)
- `offset`: Pagination offset (default: 0)
- `sortBy`: `score`, `commits`, `prs`, or `issues`

**Response:**
```json
{
  "users": [
    {
      "rank": 1,
      "username": "top-contributor",
      "score": 5000,
      "commits": 2500,
      "prs": 450,
      "issues": 200,
      "level": "legendary"
    }
  ],
  "total": 1250
}
```

### NFT & Reputation

#### POST `/api/nft/mint`

Mint a reputation NFT for the authenticated user.

**Request:**
```json
{
  "tokenUri": "ipfs://..."
}
```

**Response:**
```json
{
  "tokenId": "42",
  "transactionHash": "0x...",
  "status": "pending"
}
```

## 📜 Smart Contracts

### ReputationNFT.sol

ERC-721 contract for minting reputation badges.

**Features:**
- One NFT per user per minting cycle
- Stores GitHub stats (score, commits, PRs, issues)
- Tracks minting timestamp
- Read-only metadata function

**Key Functions:**
```solidity
// Mint a reputation NFT
function mintReputation(
  uint256 score,
  uint256 commits,
  uint256 prs,
  uint256 issues,
  string calldata githubUsername
) external

// Get token metadata
function getTokenData(uint256 tokenId)
  external view
  returns (ReputationData memory)
```

## 🔐 Environment Variables

### Backend (`.env`)

```env
# Server
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/gitrap
DIRECT_URL=postgresql://user:password@localhost:5432/gitrap

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_app_id
GITHUB_CLIENT_SECRET=your_github_app_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY=7d

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key

# Blockchain
BLOCKCHAIN_RPC_URL=https://mainnet.infura.io/v3/PROJECT_ID
CONTRACT_ADDRESS=0x...
PRIVATE_KEY=your_wallet_private_key
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_app_id
NEXT_PUBLIC_INFURA_KEY=your_infura_key
```

## 🛠️ Development Workflow

### Running in Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Both servers will run with hot reload enabled.

### Type Checking

```bash
# Backend
cd backend && npm run typecheck

# Frontend
cd frontend && npm run typecheck
```

### Building for Production

```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

## 🧪 Testing

### Backend Testing

```bash
cd backend

# Run tests (if configured)
npm run test

# Test with coverage
npm run test:coverage
```

### Frontend Testing

```bash
cd frontend

# Run tests
npm run test

# Test with coverage
npm run test:coverage
```

## 🌐 Deployment

### Backend Deployment (Vercel/Railway)

```bash
cd backend

# Build
npm run build

# Set environment variables in hosting platform
# Deploy
git push # or use platform's CLI
```

### Frontend Deployment (Vercel)

```bash
cd frontend

# Vercel automatically detects Next.js
git push
```

### Database Migrations in Production

```bash
npm run prisma:deploy
```

### Smart Contract Deployment

```bash
cd smart_contracts

# Deploy to mainnet (requires setup)
npx hardhat run scripts/deploy.js --network mainnet
```

## 📋 Recent Fixes

See [FIXES.md](./FIXES.md) for a detailed log of recent bug fixes and improvements including:

- GitHub issue creation HTTP method fixes
- DAO votes endpoint error handling
- Backend error handler improvements
- Frontend DAO page error display enhancements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use Prettier for code formatting
- Write tests for new features
- Update documentation for API changes
- Use conventional commits

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋 Support

For issues, questions, or suggestions:

1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Join our Discord community (link here)
4. Contact the development team

## 🔗 Links

- **GitHub**: https://github.com/yourusername/gitrap
- **Documentation**: https://docs.gitrap.io
- **Smart Contracts**: [Ethereum Mainnet/Testnet Address]
- **Frontend**: https://app.gitrap.io

---

**Built with ❤️ by the GitRap team**
