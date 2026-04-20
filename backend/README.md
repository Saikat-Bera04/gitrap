# gitrap Backend

Production-oriented Express API for connecting GitHub identity, wallet identity, GitHub contribution aggregation, reputation scoring, leaderboard reads, NFT metadata generation, and future smart contract score sync.

## Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy environment variables:

   ```sh
   cp .env.example .env
   ```

3. Configure Neon:

   - `DATABASE_URL` should use Neon pooled Postgres for runtime API traffic.
   - `DIRECT_URL` should use the direct Neon database URL for Prisma migrations.

4. Generate Prisma client and migrate:

   ```sh
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. Start the API:

   ```sh
   npm run dev
   ```

## Auth Flow

`POST /api/auth/github` accepts:

```json
{
  "code": "github-oauth-code",
  "walletAddress": "0x..."
}
```

The server exchanges the code with GitHub, validates the token by fetching the GitHub profile, aggregates contribution data, encrypts the GitHub access token at rest, stores the score, and returns a signed API bearer token.

Authenticated routes require:

```http
Authorization: Bearer <token>
```

## Routes

- `POST /api/auth/github`
- `GET /api/user/profile`
- `GET /api/user/score`
- `POST /api/user/refresh`
- `GET /api/leaderboard?limit=25&page=1`
- `POST /api/nft/metadata`
- `POST /api/score/sync`

## Scoring

Score formula:

```txt
(commits * 1) + (merged pull requests * 5) + (issues * 3) + (stars * 0.5)
```

The scoring module filters obvious low-quality commit subjects and applies soft-cap normalization so very large GitHub accounts do not dominate the leaderboard linearly.

## GitHub API Notes

The GitHub integration uses REST pagination, detects rate-limit responses, sums stars from owned non-fork repositories, prioritizes merged PRs, and caches refreshes via `User.lastUpdated`. `POST /api/user/refresh` returns cached data inside the configured `SCORE_CACHE_MINUTES` window unless `force` is `true`.
