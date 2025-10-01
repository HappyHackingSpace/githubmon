# GitHubMon

A powerful platform to analyze GitHub organizations, trending repositories, top contributors, and more.  
Easily search for repositories, users, and organizations with advanced analytics and a user-friendly interface.

## Features

- 🔍 Fast search for repositories, users, and organizations
- 📊 Organization analytics and statistics
- 🏆 Trending repositories and top contributors
- 🌗 Light/Dark theme support
- 📝 Personal Access Token login for higher API rate limits
- 🕒 Search history and recent searches
- ⚡ Dashboard and customizable settings

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/githubmon.git
   cd githubmon
   ```

2. Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. Set up environment variables:
   ```sh
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and fill in the required values:
   - `GITHUB_CLIENT_ID` - Your GitHub OAuth App Client ID
   - `GITHUB_CLIENT_SECRET` - Your GitHub OAuth App Client Secret
   - `NEXTAUTH_SECRET` - A random secret for NextAuth.js
   - `NEXTAUTH_URL` - Your application URL (http://localhost:3000 for development)

4. Start the development server:
   ```sh
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables Setup

This application requires GitHub OAuth for authentication. Follow these steps:

#### 1. Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/applications/new)
2. Create a new OAuth App with these settings:
   - **Application name**: GitHubMon (or your preferred name)
   - **Homepage URL**: `http://localhost:3000` (for development)
   - **Application description**: Optional description
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`

3. After creating the app, copy the **Client ID** and **Client Secret**

#### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and update the values:

```bash
# Required - Get these from your GitHub OAuth App
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# Required - Generate a random secret
NEXTAUTH_SECRET=your_random_secret_here

# Required - Your app URL
NEXTAUTH_URL=http://localhost:3000
```

To generate a secure `NEXTAUTH_SECRET`, you can use:
```bash
openssl rand -base64 32
```

#### 3. OAuth Scopes

The application requests these minimal GitHub scopes:
- `read:user` - Read basic user profile information
- `user:email` - Access user email addresses  
- `public_repo` - Read-only access to public repositories

These scopes follow the principle of least privilege and provide secure access without unnecessary permissions.

## Usage

- You can use the app without a GitHub token, but rate limits will be low (60 requests/hour).
- For full features and higher limits (5,000 requests/hour), log in with your [GitHub Personal Access Token](https://github.com/settings/tokens).
- To generate a token:
  1. Go to GitHub → Settings → Developer settings → Personal access tokens
  2. Click "Generate new token (classic)"
  3. Select required scopes (e.g., `repo`, `user`)
  4. Copy and save your token securely

## Settings

- Change organization/user name and token anytime from the Settings page.
- Switch between light and dark themes.
- Clear all local data with one click.

## Security

- Your token is stored only in your browser (local storage).
- It is never sent to any server.
- Tokens are automatically deleted after 1 month.
- You can log out anytime.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT  

## Docker

### Development (hot reload)
```bash
# Build and start
docker compose -f docker-compose.dev.yml up --build
# Then open http://localhost:3000
```
- Code changes on your host are reflected inside the container.
- Uses bind mounts and `npm run dev`.

### Production
```bash
# Build image and start
docker compose up --build -d
# Tail logs
docker compose logs -f
# Stop
docker compose down
```
Set required environment variables (can be .env file in project root):
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace_with_secure_random
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```
The production image uses Next.js standalone output for a small runtime.  