# Passport Score Checker

A web app that lets users connect an Ethereum wallet and check their [Human Passport](https://passport.xyz) score to determine if they are verified as human. Users can also increase their score by verifying stamps directly within the app via the Passport embed.

## Live Demo

[https://tbsoc.github.io/passport-score-checker/](https://tbsoc.github.io/passport-score-checker/)

## Features

- **Multi-wallet connection** via [RainbowKit](https://www.rainbowkit.com/) (MetaMask, Coinbase Wallet, WalletConnect, etc.)
- **Passport score lookup** using the [Passport API](https://docs.passport.xyz/)
- **Human/robot detection** based on a configurable score threshold (default: 20)
- **Passport embed** for verifying stamps and increasing your score without leaving the app
- **Direct dashboard link** to [app.passport.xyz](https://app.passport.xyz) for additional stamp verification

## Tech Stack

- React 18
- Vite
- RainbowKit + wagmi + viem (wallet connection)
- @human.tech/passport-embed (stamp verification widget)
- Passport API v2 (score lookup)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install --legacy-peer-deps
```

### Run locally

```bash
npm run dev
```

The app will be available at `http://localhost:5174`.

### Build for production

```bash
npm run build
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

## Configuration

API keys and scorer ID are configured in the source files:

| Key | File | Description |
|-----|------|-------------|
| Stamps API Key | `src/components/PassportChecker.jsx` | Used for score lookups |
| Embed API Key | `src/components/StampEmbed.jsx` | Used for the Passport embed widget |
| Scorer ID | `src/components/PassportChecker.jsx` | Your Passport scorer instance |
| Score Threshold | `src/components/PassportChecker.jsx` | Minimum score to be considered human (default: 20) |

## Project Structure

```
src/
  main.jsx                      # App entry, RainbowKit/wagmi providers
  App.jsx                       # Layout with ConnectButton + PassportChecker
  components/
    PassportChecker.jsx          # Score checking UI and API integration
    StampEmbed.jsx               # Passport embed modal for stamp verification
```

## License

MIT
