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
- (Optional) [Make](https://www.gnu.org/software/make/) for Docker shortcuts
- (Optional) [Docker](https://www.docker.com/) for containerized development

### Installation

#### Standard Setup (Local Development)

1. Clone the repository:
   ```bash
   git clone https://github.com/HappyHackingSpace/githubmon.git
   cd githubmon
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and fill in the required values (see [Environment Variables Setup](#environment-variables-setup))

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

#### Docker Setup (Alternative)

If you prefer Docker:

```bash
# Clone the repository
git clone https://github.com/HappyHackingSpace/githubmon.git
cd githubmon

# Setup environment (creates .env.local)
make setup
# Edit .env.local with your credentials

# Start with Docker
make docker-dev
```

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

To generate a secure `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

#### 3. OAuth Scopes

The application requests these minimal GitHub scopes:
- `read:user` - Read basic user profile information
- `user:email` - Access user email addresses  
- `public_repo` - Read-only access to public repositories

These scopes follow the principle of least privilege and provide secure access without unnecessary permissions.

## Development

### Local Development (Recommended for daily work)

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

**Advantages:**
- ⚡ Fastest hot reload
- 🔧 Easy debugging
- 💻 Direct IDE integration

### Docker Development (For testing containerized environment)

#### Using Make (Linux/Mac/Git Bash)

```bash
make docker-dev              # Start development container
make docker-dev-build        # Rebuild and start (when Dockerfile changes)
make docker-dev-logs         # Show container logs
make docker-dev-down         # Stop container
```

#### Using Docker Compose directly

```bash
docker compose -f docker-compose.dev.yml up              # Start
docker compose -f docker-compose.dev.yml up --build      # Rebuild and start
docker compose -f docker-compose.dev.yml logs -f         # Show logs
docker compose -f docker-compose.dev.yml down            # Stop
```

**When to use Docker for development:**
- 🧪 Testing production-like environment
- 🔄 Before submitting PRs
- 🐛 Reproducing production issues
- 👥 Ensuring consistency across team

### Docker Production

#### Using Make

```bash
make docker-prod         # Build and start production containers
make docker-up           # Start existing containers
make docker-down         # Stop all containers
make docker-logs         # Show production logs
make docker-restart      # Restart containers
make clean-docker        # Remove all containers and volumes
```

#### Using Docker Compose directly

```bash
docker compose up --build -d     # Build and start
docker compose up -d             # Start existing
docker compose logs -f           # Show logs
docker compose down              # Stop
docker compose down -v           # Stop and remove volumes
```

### Make Commands Reference

| Command | Description |
|---------|-------------|
| `make help` | Show all available commands |
| `make setup` | Create .env.local from example |
| `make env` | Same as setup |
| **Development** | |
| `make docker-dev` | Start dev container (uses cache) |
| `make docker-dev-build` | Rebuild and start dev container |
| `make docker-dev-logs` | Show dev container logs |
| `make docker-dev-down` | Stop dev container |
| **Production** | |
| `make docker-prod` | Build and start production |
| `make docker-up` | Start production (no build) |
| `make docker-down` | Stop all containers |
| `make docker-logs` | Show production logs |
| `make docker-restart` | Restart production containers |
| **Utilities** | |
| `make clean-docker` | Remove containers and volumes |

**Quick aliases available:** `make dev`, `make prod`, `make up`, `make down`, `make logs`, `make restart`

## Usage

- You can use the app without a GitHub token, but rate limits will be low (60 requests/hour)
- For full features and higher limits (5,000 requests/hour), log in with your [GitHub Personal Access Token](https://github.com/settings/tokens)
- To generate a token:
  1. Go to GitHub → Settings → Developer settings → Personal access tokens
  2. Click "Generate new token (classic)"
  3. Select required scopes (e.g., `repo`, `user`)
  4. Copy and save your token securely

## Settings

- Change organization/user name and token anytime from the Settings page
- Switch between light and dark themes
- Clear all local data with one click

## Security

- Your token is stored only in your browser (local storage)
- It is never sent to any server
- Tokens are automatically deleted after 1 month
- You can log out anytime

## Platform-Specific Notes

### Windows Users

**Option 1: Use npm directly** (Easiest)
```powershell
npm run dev
npm run build
```

**Option 2: Install Make**
```powershell
# Using Chocolatey
choco install make
```

**Option 3: Use Git Bash**
- All `make` commands work in Git Bash
- Comes pre-installed with Git for Windows

### Linux/Mac Users

Make is usually pre-installed. If not:

```bash
# Ubuntu/Debian
sudo apt-get install build-essential

# macOS (if needed)
xcode-select --install
```

## Development Workflow Recommendations

### Solo Developer / Quick Prototyping
```bash
# Fast iteration
npm run dev
```

### Team / Production-Ready Testing
```bash
# Ensure consistency
make docker-dev
```

### Before Deploying
```bash
# Test production build
make docker-prod
make docker-logs
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT