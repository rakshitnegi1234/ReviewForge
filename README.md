# ReviewForge

ReviewForge is an AI-powered GitHub pull request review platform. Users connect their GitHub repositories, ReviewForge creates repository webhooks, indexes the codebase for retrieval, and automatically posts AI-generated review comments when pull requests are opened or updated.

## Features

- GitHub OAuth authentication with Better Auth
- Connected repository management
- GitHub webhook creation for pull request events
- Background workflows with Inngest
- Codebase indexing with embeddings and Pinecone
- PR diff fetching with Octokit
- AI review generation with Google Gemini through the AI SDK
- GitHub PR comments with generated review output
- Review history page with completed and failed reviews
- Settings page to delete connected repos, related reviews, and matching webhooks
- Dashboard stats for connected repos, commits, PRs, and AI reviews

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Prisma 7
- PostgreSQL
- Better Auth
- Octokit
- Inngest
- Pinecone
- AI SDK
- Google Gemini
- TanStack Query
- Tailwind CSS / shadcn-style UI components

## How It Works

### Repository Connect Flow

1. User signs in with GitHub.
2. User connects a repository from the dashboard.
3. Server action validates the session.
4. App creates a GitHub webhook for `pull_request` events.
5. Repository is saved in PostgreSQL.
6. App sends an Inngest event named `repository.connected`.
7. Inngest fetches repository files and indexes relevant code in Pinecone.

### Pull Request Review Flow

1. A pull request is opened or updated on GitHub.
2. GitHub sends a webhook to `/api/webhooks/github`.
3. The webhook route detects `pull_request` events.
4. `reviewPullRequest` validates the connected repo and GitHub token.
5. App sends an Inngest event named `pr.review.requested`.
6. Inngest fetches PR metadata and diff.
7. Inngest retrieves relevant codebase context from Pinecone.
8. Gemini generates a markdown code review.
9. ReviewForge posts the review as a GitHub PR comment.
10. The review is saved in the database.

## Important Routes

- `/dashboard` - overview and stats
- `/dashboard/repository` - connect GitHub repositories
- `/dashboard/reviews` - view completed and failed AI reviews
- `/dashboard/settings` - delete connected repositories
- `/api/auth/[...all]` - Better Auth API route
- `/api/webhooks/github` - GitHub webhook receiver
- `/api/inngest` - Inngest function endpoint

## Project Structure

```txt
app/
  api/
    auth/[...all]/route.ts
    inngest/route.ts
    webhooks/github/route.ts
  dashboard/
    page.tsx
    repository/page.tsx
    reviews/page.tsx
    settings/page.tsx

inngest/
  client.ts
  functions/
    index.ts
    review.ts

module/
  ai/
    actions/index.ts
    lib/rag.ts
  github/
    lib/github.ts
  repository/
    actions/index.ts
    hooks/
  reviews/
    actions/index.ts
    components/reviews-list.tsx
  settings/
    actions/index.ts
    components/

prisma/
  schema.prisma
  migrations/
```

## Environment Variables

Create a `.env` or `.env.local` file with:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

GITHUB_CLIENT_ID="your_github_oauth_client_id"
GITHUB_CLIENT_SECRET="your_github_oauth_client_secret"

NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_BASE_URL="your_public_app_url"

PINECONE_DB_API_KEY="your_pinecone_api_key"
GOOGLE_GENERATIVE_AI_API_KEY="your_google_ai_api_key"
```

For local GitHub webhooks, `NEXT_PUBLIC_APP_BASE_URL` must be a public URL such as an ngrok URL. GitHub cannot call plain `localhost`.

Example:

```env
NEXT_PUBLIC_APP_BASE_URL="https://your-ngrok-url.ngrok-free.app"
```

## Setup

Install dependencies:

```bash
npm install
```

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Generate Prisma client:

```bash
npx prisma generate
```

Start the Next.js app:

```bash
npm run dev
```

Start Inngest dev server in another terminal:

```bash
npm run inngest:dev
```

## Scripts

```bash
npm run dev
npm run inngest:dev
npm run build
npm run start
npm run lint
```

## Testing the Full Flow

1. Start the Next.js app.
2. Start the Inngest dev server.
3. Expose the local app with ngrok or another tunnel.
4. Set `NEXT_PUBLIC_APP_BASE_URL` to that public URL.
5. Sign in with GitHub.
6. Connect a repository.
7. Open a pull request in that repository.
8. Confirm the Inngest review job runs.
9. Confirm a GitHub PR comment is posted.
10. Confirm the review appears in `/dashboard/reviews`.

## Database Models

Better Auth manages:

- `User`
- `Session`
- `Account`
- `Verification`

ReviewForge adds:

- `Repository` - stores connected GitHub repositories
- `Review` - stores AI review output and status for pull requests

`Review.repositoryId` links each review to a repository. Deleting a connected repository cascades and removes its related reviews.

## Notes

- GitHub webhook `ping` events return `Pong`.
- Pull request reviews run for `opened` and `synchronize` actions.
- The settings delete flow removes matching GitHub webhooks when possible.
- If the GitHub repo no longer exists, local repository data is still deleted.
- AI review jobs are handled in the background so webhook responses stay fast.
