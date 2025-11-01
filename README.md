# Cipherverse Fleet

<div align="center">

**An FHE-Enabled Blockchain Game Where Privacy Meets Strategy**

[![License](https://img.shields.io/badge/license-BSD--3--Clause--Clear-blue.svg)](LICENSE)
[![Solidity](https://img.shields.io/badge/solidity-0.8.27-363636.svg)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/hardhat-2.26.0-yellow.svg)](https://hardhat.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.8.3-3178c6.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/react-18.x-61dafb.svg)](https://reactjs.org/)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Why Cipherverse Fleet?](#why-cipherverse-fleet)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Problems Solved](#problems-solved)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
- [Development](#development)
  - [Compile Contracts](#compile-contracts)
  - [Run Tests](#run-tests)
  - [Deploy Locally](#deploy-locally)
  - [Deploy to Sepolia](#deploy-to-sepolia)
- [Frontend Development](#frontend-development)
- [Smart Contract Overview](#smart-contract-overview)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Testing Strategy](#testing-strategy)
- [Security Considerations](#security-considerations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

---

## Overview

**Cipherverse Fleet** is a pioneering blockchain-based game that leverages **Fully Homomorphic Encryption (FHE)** to create a strategic NFT battle system where player stats remain completely private on-chain. Built on **Zama's FHEVM protocol**, Cipherverse Fleet allows players to mint unique spaceship NFTs with encrypted attack power, launch attacks against encrypted defenses, and reveal results only when they choose to.

Unlike traditional blockchain games where all data is transparent, Cipherverse Fleet ensures that critical gameplay elements remain encrypted end-to-end, opening new possibilities for strategic gameplay, competitive fairness, and true data ownership.

## Key Features

### Core Gameplay

- **Free Spaceship Minting**: Each player can mint exactly one spaceship NFT for free
- **Encrypted Attack Power**: Every spaceship starts with an encrypted attack power of 100, hidden from other players and even the contract itself
- **Private Battle System**: Launch attacks against encrypted defense values with results stored as encrypted booleans
- **On-Demand Decryption**: Only you can decrypt your spaceship's stats and battle results using your private keys
- **Transparent Ownership**: Full ERC721-compatible NFT ownership with on-chain verification

### Technical Highlights

- **Fully Homomorphic Encryption**: Powered by Zama's FHEVM, enabling computations on encrypted data without decryption
- **Zero-Knowledge Privacy**: Attack power and battle results remain encrypted on-chain, only decryptable by the owner
- **Gasless Decryption**: Decryption happens off-chain via Zama's relayer, not requiring gas for private key operations
- **Type-Safe Development**: Full TypeScript support for both frontend and backend
- **Production-Ready Stack**: Built with industry-standard tools (Hardhat, Ethers.js, Viem, Wagmi, React)

## Why Cipherverse Fleet?

### Revolutionary Advantages

#### 1. **True Privacy on a Public Blockchain**
Traditional blockchain games expose all player data publicly, making strategies predictable and gameplay stale. Cipherverse Fleet uses FHE to keep critical stats encrypted while maintaining blockchain's transparency for ownership and transactions.

#### 2. **Fair Competitive Gameplay**
With encrypted attack power, players can't scout opponents' exact stats before battles, creating a level playing field where strategy and risk assessment matter more than information asymmetry.

#### 3. **Provably Fair Mechanics**
All game logic executes on-chain with encrypted inputs. Players can verify that battles are computed correctly without revealing their private data.

#### 4. **Future-Proof Privacy**
Unlike zero-knowledge proofs that verify specific statements, FHE allows arbitrary computations on encrypted data, enabling complex game mechanics without compromising privacy.

#### 5. **No Centralized Servers**
All game state lives on-chain. No centralized server can be compromised, shut down, or manipulate player data. True ownership and permanence.

#### 6. **Composability**
As an ERC721-compatible NFT with FHE capabilities, Cipherverse spaceships can integrate with other DeFi protocols, marketplaces, and games while maintaining their encrypted properties.

## Technology Stack

### Smart Contracts

| Technology | Version | Purpose |
|------------|---------|---------|
| **Solidity** | 0.8.27 | Smart contract programming language |
| **Hardhat** | 2.26.0 | Development environment and testing framework |
| **Zama FHEVM** | 0.8.0+ | Fully Homomorphic Encryption library for Solidity |
| **OpenZeppelin (implicit)** | Latest | Industry-standard contract patterns |
| **Ethers.js** | 6.15.0 | Ethereum interaction library |

### Frontend

| Technology | Purpose |
|------------|---------|
| **React** | 18.x - Modern UI framework |
| **TypeScript** | 5.8.3 - Type-safe development |
| **Vite** | Latest - Lightning-fast build tool |
| **Wagmi** | Latest - React hooks for Ethereum |
| **Viem** | Latest - TypeScript Ethereum library for contract reads |
| **RainbowKit** | Latest - Beautiful wallet connection UI |
| **Zama Relayer SDK** | 0.2.0+ - FHE decryption service |

### Development Tools

- **TypeChain**: Automatic TypeScript bindings for smart contracts
- **Hardhat Deploy**: Deterministic deployment system
- **Mocha/Chai**: Testing framework
- **ESLint/Prettier**: Code quality and formatting
- **Solhint**: Solidity linting

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  RainbowKit  │  │    Wagmi     │  │  Zama SDK    │      │
│  │   (Wallet)   │  │ (Web3 Hooks) │  │(FHE Relayer) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Ethereum Network (Sepolia)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            CipherverseFleet Smart Contract            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │  │
│  │  │  Mint Ship   │  │ Launch Attack│  │  Decrypt  │  │  │
│  │  │  (euint32)   │  │  (ebool)     │  │ (Relayer) │  │  │
│  │  └──────────────┘  └──────────────┘  └───────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                               │
│                              ▼                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Zama FHEVM Coprocessor                   │  │
│  │         (Performs FHE Operations On-Chain)            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Contract Architecture

The `CipherverseFleet` contract uses a modular design:

```solidity
CipherverseFleet
├── Ship Struct
│   ├── euint32 attackPower    (encrypted)
│   └── ebool lastAttackSuccess (encrypted)
├── NFT State
│   ├── Token ownership mapping
│   ├── Balance tracking
│   └── Ship assignment
└── FHE Operations
    ├── Mint with encrypted initialization
    ├── Attack comparison (encrypted ≥ operation)
    └── Permission-based decryption
```

### Data Flow: Minting a Spaceship

```
1. User calls mintShip()
2. Contract creates euint32(100) for attack power
3. Contract creates ebool(false) for initial battle status
4. Contract grants decryption permissions to user
5. Emit Transfer event
6. Frontend updates UI
```

### Data Flow: Launching an Attack

```
1. User inputs defense value (plaintext)
2. Frontend encrypts value using Zama SDK
3. User signs encrypted input with wallet
4. Frontend calls launchAttack(tokenId, encryptedDefense, proof)
5. Contract performs FHE comparison: attackPower ≥ defense
6. Result stored as encrypted ebool
7. User can decrypt result using Zama relayer
```

## Problems Solved

### 1. **Public Blockchain Privacy Paradox**
**Problem**: Blockchain's transparency makes it unsuitable for games requiring hidden information.
**Solution**: FHE enables on-chain computation on encrypted data, maintaining privacy without compromising decentralization.

### 2. **Predictable Gameplay**
**Problem**: Traditional blockchain games expose all stats, making optimal strategies trivial.
**Solution**: Encrypted attack power creates uncertainty, rewarding strategic thinking over information exploitation.

### 3. **Centralized Game Servers**
**Problem**: Most crypto games still rely on centralized servers for game logic, creating single points of failure.
**Solution**: All game logic runs on-chain with FHE, ensuring permanence and censorship resistance.

### 4. **Lack of True Ownership**
**Problem**: Players don't truly own in-game assets if the game server can manipulate them.
**Solution**: NFT ownership combined with on-chain encrypted state gives players complete control.

### 5. **Scalability vs Privacy Trade-off**
**Problem**: Privacy solutions like zk-SNARKs are complex and limited in functionality.
**Solution**: FHEVM provides general-purpose encrypted computation, enabling rich game mechanics.

### 6. **MEV and Front-Running**
**Problem**: Public transaction pools allow attackers to front-run game moves.
**Solution**: Encrypted inputs prevent attackers from extracting value from transaction observation.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js**: Version 20 or higher
  ```bash
  node --version  # Should be >= 20.0.0
  ```
- **npm**: Version 7 or higher
  ```bash
  npm --version   # Should be >= 7.0.0
  ```
- **Git**: For version control
  ```bash
  git --version
  ```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Cipherverse.git
   cd Cipherverse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify installation**
   ```bash
   npm run compile
   ```

### Environment Setup

Create a `.env` file in the project root:

```env
# Required: Private key for deployment (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Required: Infura API key for Sepolia access
INFURA_API_KEY=your_infura_api_key_here

# Optional: Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

**Security Note**: Never commit `.env` files or expose private keys publicly.

## Development

### Compile Contracts

Compile all Solidity contracts:

```bash
npm run compile
```

This generates:
- Compiled artifacts in `artifacts/`
- TypeChain types in `types/`
- Deployment data in `deployments/`

### Run Tests

Run the complete test suite on a local Hardhat network:

```bash
npm run test
```

Expected output:
```
  CipherverseFleet
    ✓ mints an encrypted spaceship with attack power 100
    ✓ prevents pilots from minting more than one ship
    ✓ records attack outcomes as encrypted booleans

  3 passing (2s)
```

### Deploy Locally

1. **Start a local FHEVM-enabled node:**
   ```bash
   npx hardhat node
   ```

2. **In a new terminal, deploy contracts:**
   ```bash
   npx hardhat deploy --network localhost
   ```

3. **Run tasks to interact with contracts:**
   ```bash
   npx hardhat ship:mint --network localhost
   npx hardhat ship:attack --network localhost --defense 80
   ```

### Deploy to Sepolia

1. **Ensure your `.env` is configured with:**
   - `PRIVATE_KEY`: Account with Sepolia ETH
   - `INFURA_API_KEY`: Valid Infura project ID
   - `ETHERSCAN_API_KEY`: For verification

2. **Deploy to Sepolia testnet:**
   ```bash
   npx hardhat deploy --network sepolia
   ```

3. **Verify on Etherscan:**
   ```bash
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

4. **Test on live network:**
   ```bash
   npm run test:sepolia
   ```

## Frontend Development

### Setup Frontend

Navigate to the frontend directory:

```bash
cd src
npm install
```

### Configure Frontend

Update contract address in `src/config/contracts.ts`:

```typescript
export const CONTRACT_ADDRESS = '0xYourDeployedContractAddress';
```

The ABI is automatically copied from `deployments/sepolia/CipherverseFleet.json`.

### Run Development Server

```bash
npm run dev
```

Access at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview  # Test production build
```

### Frontend Architecture

```
src/
├── src/
│   ├── components/
│   │   ├── FleetApp.tsx      # Main application component
│   │   └── Header.tsx         # Navigation header
│   ├── hooks/
│   │   ├── useEthersSigner.ts # Ethers.js signer from Wagmi
│   │   └── useZamaInstance.ts # Zama FHE relayer instance
│   ├── config/
│   │   ├── contracts.ts       # Contract address & ABI
│   │   └── wagmi.ts           # Wagmi configuration
│   ├── styles/               # CSS modules
│   └── main.tsx              # Application entry point
└── package.json
```

## Smart Contract Overview

### Contract: `CipherverseFleet.sol`

**Location**: `contracts/CipherverseFleet.sol`

#### Core Functions

##### `mintShip() → uint256`
Mints a new spaceship NFT with encrypted attack power of 100.

**Restrictions**: Each address can only mint one ship.

**Returns**: Token ID of the minted spaceship.

**Events**: `Transfer(address(0), msg.sender, tokenId)`

##### `launchAttack(uint256 tokenId, externalEuint32 enemyDefense, bytes inputProof) → ebool`
Launches an encrypted attack comparing your ship's attack power against the provided encrypted defense.

**Parameters**:
- `tokenId`: Your spaceship's token ID
- `enemyDefense`: Encrypted defense value (created via Zama SDK)
- `inputProof`: Cryptographic proof for the encrypted input

**Returns**: Encrypted boolean representing attack success (attackPower ≥ defense)

**Events**: `AttackLaunched(pilot, tokenId, success)`

##### `getAttackPower(uint256 tokenId) → euint32`
Retrieves the encrypted attack power of a spaceship.

**Note**: Returns encrypted data. Use Zama relayer to decrypt.

##### `getLastAttackResult(uint256 tokenId) → ebool`
Retrieves the encrypted result of the last attack.

**Note**: Returns encrypted boolean. Decrypt to see if attack succeeded.

#### View Functions

- `ownerOf(uint256 tokenId) → address`: Returns ship owner
- `balanceOf(address owner) → uint256`: Returns number of ships owned
- `shipOf(address pilot) → uint256`: Returns token ID owned by pilot (0 if none)
- `totalSupply() → uint256`: Returns total number of minted ships

## How It Works

### Encrypted Types

Cipherverse Fleet uses Zama's encrypted types:

- **`euint32`**: 32-bit encrypted unsigned integer (for attack power)
- **`ebool`**: Encrypted boolean (for attack results)
- **`externalEuint32`**: Encrypted input from external sources

### FHE Operations

```solidity
// Initialization
euint32 power = FHE.asEuint32(100);

// Comparison (happens on encrypted data!)
ebool success = FHE.ge(attackPower, defense);  // Greater or equal

// Permission management
FHE.allow(power, msg.sender);  // Grant decryption rights
```

### Decryption Flow

1. **Request**: User requests decryption via Zama SDK
2. **Keypair**: SDK generates temporary keypair
3. **Signature**: User signs EIP-712 message proving ownership
4. **Relayer**: Zama relayer verifies permissions and decrypts
5. **Result**: Plaintext value returned to user

**Key Point**: Decryption never happens on-chain, preserving privacy.

## Project Structure

```
Cipherverse/
├── contracts/                  # Solidity smart contracts
│   └── CipherverseFleet.sol   # Main game contract
├── deploy/                     # Deployment scripts
│   └── deploy.ts              # Hardhat-deploy script
├── tasks/                      # Custom Hardhat tasks
│   ├── accounts.ts            # List test accounts
│   └── CipherverseFleet.ts    # Contract interaction tasks
├── test/                       # Test suites
│   ├── CipherverseFleet.ts    # Local tests
│   └── CipherverseFleetSepolia.ts  # Sepolia integration tests
├── src/                        # Frontend React application
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── config/            # Configuration files
│   │   └── styles/            # CSS styles
│   └── package.json           # Frontend dependencies
├── types/                      # TypeChain generated types
├── artifacts/                  # Compiled contract artifacts
├── deployments/                # Deployment records
├── hardhat.config.ts           # Hardhat configuration
├── package.json                # Project dependencies
├── tsconfig.json               # TypeScript configuration
├── .env                        # Environment variables (gitignored)
└── README.md                   # This file
```

## Testing Strategy

### Local Tests (Mock FHE)

File: `test/CipherverseFleet.ts`

Uses Hardhat's FHEVM mock mode for fast iteration:

```bash
npm run test
```

**Coverage**:
- Minting mechanics
- One-ship-per-address restriction
- Encrypted attack power initialization
- Attack success/failure scenarios
- Decryption functionality

### Sepolia Tests (Real FHE)

File: `test/CipherverseFleetSepolia.ts`

Runs against deployed contract on Sepolia testnet:

```bash
npm run test:sepolia
```

**Coverage**:
- Real FHE encryption/decryption
- Zama relayer integration
- Gas usage profiling
- End-to-end user flows

### Coverage Report

Generate detailed coverage report:

```bash
npm run coverage
```

**Target**: >90% code coverage

## Security Considerations

### Smart Contract Security

1. **Custom Errors**: Gas-efficient error handling
2. **Access Control**: Owner-only operations properly restricted
3. **Reentrancy**: No external calls in state-changing functions
4. **Integer Overflow**: Solidity 0.8+ built-in protection
5. **Permission Management**: Strict FHE permission granting

### Frontend Security

1. **Input Validation**: All user inputs validated before encryption
2. **Signature Verification**: EIP-712 typed signatures for relayer requests
3. **Private Key Handling**: Keys never leave the browser
4. **CORS**: Proper configuration for relayer API calls

### Known Limitations

- **Gas Costs**: FHE operations are more expensive than plaintext
- **Decryption Latency**: Off-chain decryption may take 5-10 seconds
- **Sepolia Only**: Currently deployed on testnet for development
- **Single Ship**: Intentional design choice to prevent spam

## Roadmap

### Phase 1: Core Mechanics (Current)
- [x] Basic spaceship minting
- [x] Encrypted attack power
- [x] Simple attack system
- [x] React frontend
- [x] Sepolia deployment

### Phase 2: Enhanced Gameplay (Q2 2025)
- [ ] Multiple attack types (laser, missile, plasma)
- [ ] Encrypted defense power
- [ ] Ship upgrades with encrypted stats
- [ ] Achievement system
- [ ] Leaderboard (encrypted ranks)

### Phase 3: Multiplayer (Q3 2025)
- [ ] PvP battles with encrypted matchmaking
- [ ] Fleet formation (multiple ships per player)
- [ ] Encrypted resource system
- [ ] Territory control mechanics
- [ ] Tournament system

### Phase 4: Economy (Q4 2025)
- [ ] NFT marketplace integration
- [ ] Crafting system with encrypted recipes
- [ ] Staking and rewards
- [ ] Governance token
- [ ] Cross-chain bridges

### Phase 5: Mainnet & Scaling (2026)
- [ ] Ethereum mainnet deployment
- [ ] L2 scaling solution integration
- [ ] Mobile app (React Native)
- [ ] Social features
- [ ] Third-party integrations

### Research & Innovation
- [ ] ZK-FHE hybrid for optimal privacy/cost
- [ ] Encrypted random number generation on-chain
- [ ] AI opponents with encrypted strategies
- [ ] Cross-game interoperability

## Contributing

We welcome contributions from the community!

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   npm run test
   npm run lint
   ```
5. **Commit with clear messages**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Standards

- **Solidity**: Follow Solhint rules, include NatSpec comments
- **TypeScript**: Strict mode enabled, no `any` types
- **React**: Functional components with hooks
- **Testing**: Minimum 80% coverage for new code
- **Documentation**: Update README for feature changes

## License

This project is licensed under the **BSD-3-Clause-Clear License**.

Key points:
- ✅ Commercial use permitted
- ✅ Modification permitted
- ✅ Distribution permitted
- ❌ Patent claims explicitly not granted
- ❌ No liability or warranty

See [LICENSE](LICENSE) file for full details.

## Support

### Documentation

- **Zama FHEVM Docs**: https://docs.zama.ai/fhevm
- **Hardhat Docs**: https://hardhat.org/docs
- **React Docs**: https://react.dev

### Community

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/Cipherverse/issues)
- **Zama Discord**: [Join the Zama community](https://discord.gg/zama)
- **Twitter**: Follow [@Cipherverse](#) for updates

### FAQ

**Q: Why can I only mint one ship?**
A: This prevents spam and ensures fair distribution during the testnet phase. Future versions will support multiple ships.

**Q: How long does decryption take?**
A: Typically 5-10 seconds via Zama's relayer service. This is off-chain and doesn't cost gas.

**Q: Can I sell my spaceship?**
A: The contract is ERC721-compatible, so yes! However, the encrypted stats are tied to your decryption permissions.

**Q: What networks are supported?**
A: Currently Sepolia testnet. Mainnet deployment planned for 2026.

**Q: Is the attack power always 100?**
A: For now, yes. Future updates will add variability, upgrades, and special abilities.

---

<div align="center">

**Built with ❤️ using Zama's FHEVM**

[Website](#) • [Documentation](#) • [Twitter](#) • [Discord](#)

</div>
