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
3. Start the development server:
   ```sh
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

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