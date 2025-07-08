# JusticeFund Exchange

A blockchain-based legal settlement platform that enables secure, transparent, and efficient processing of legal settlements using smart contracts and modern web technologies.

## 🌟 Features

### Frontend Application
- **Modern React Interface**: Built with React 18, TypeScript, and Tailwind CSS
- **Wallet Integration**: Seamless Web3 wallet connection using RainbowKit and Wagmi
- **KYC Verification**: Complete identity verification workflow
- **Document Management**: Secure notarized document upload and verification
- **Settlement Tracking**: Real-time settlement status monitoring
- **Responsive Design**: Mobile-first design with smooth animations

### Smart Contract
- **Secure Settlement Management**: Ethereum-based smart contract for settlement processing
- **Multi-party Support**: Plaintiff and defendant participation
- **Fund Escrow**: Secure fund holding and release mechanisms
- **Document Hashing**: On-chain document verification
- **Access Control**: Role-based permissions and KYC verification
- **Emergency Controls**: Pause functionality and emergency withdrawal

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Compile Smart Contracts**
   ```bash
   npm run compile
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

5. **Deploy Contracts**
   ```bash
   npm run deploy
   ```

## 🏗️ Architecture

### Frontend Stack
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing
- **RainbowKit** - Web3 wallet connection
- **Wagmi** - React hooks for Ethereum
- **Viem** - TypeScript Ethereum library

### Smart Contract Stack
- **Solidity 0.8.19** - Smart contract language
- **Hardhat** - Development environment
- **OpenZeppelin** - Security-audited contract libraries
- **Ethers.js** - Ethereum library for testing

### Key Components

#### Smart Contract (`JusticeFundSettlement.sol`)
- **Settlement Management**: Create, update, and track settlements
- **KYC Integration**: Participant verification system
- **Fund Escrow**: Secure deposit and release mechanisms
- **Document Storage**: IPFS hash storage for legal documents
- **Access Control**: Multi-role permission system

#### Frontend Pages
- **Dashboard**: Overview of settlements and quick actions
- **KYC Verification**: Multi-step identity verification
- **Notary Upload**: Document upload with notary information
- **Settlements**: Settlement management and tracking
- **Profile**: User settings and preferences

## 🔐 Security Features

### Smart Contract Security
- **ReentrancyGuard**: Protection against reentrancy attacks
- **Pausable**: Emergency pause functionality
- **Access Control**: Owner-only administrative functions
- **Input Validation**: Comprehensive parameter checking
- **Safe Transfers**: Secure ETH transfer mechanisms

### Frontend Security
- **Type Safety**: Full TypeScript implementation
- **Input Sanitization**: Proper form validation
- **Secure Storage**: Safe handling of sensitive data
- **Wallet Security**: Secure Web3 wallet integration

## 📱 User Workflows

### 1. KYC Verification
1. Complete personal information form
2. Upload identity documents
3. Provide notary information
4. Submit for verification
5. Receive approval notification

### 2. Settlement Creation
1. Connect Web3 wallet
2. Complete KYC verification
3. Create new settlement with case details
4. Add relevant documents
5. Await approval and fund deposit

### 3. Document Management
1. Upload notarized legal documents
2. Provide notary credentials
3. Track verification status
4. Download verified documents

## 🧪 Testing

### Smart Contract Tests
```bash
npm run test
```

The test suite covers:
- Contract deployment
- Participant verification
- Settlement creation and management
- Fund deposit and release
- Document management
- Security features
- Emergency functions

### Test Coverage
- **Deployment**: Contract initialization
- **Access Control**: Permission testing
- **Settlement Lifecycle**: Complete workflow testing
- **Security**: Reentrancy and pause testing
- **Edge Cases**: Error condition handling

## 🚀 Deployment

### Local Development
```bash
# Start local Hardhat node
npx hardhat node

# Deploy to local network
npm run deploy
```

### Testnet Deployment
1. Configure network in `hardhat.config.js`
2. Set environment variables:
   ```bash
   SEPOLIA_URL=your_sepolia_rpc_url
   PRIVATE_KEY=your_private_key
   ETHERSCAN_API_KEY=your_etherscan_key
   ```
3. Deploy:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

### Frontend Deployment
The frontend can be deployed to any static hosting service:
```bash
npm run build
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SEPOLIA_URL=your_sepolia_rpc_url
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_key
```

### Wallet Configuration
Update `src/config/wagmi.ts` with your WalletConnect project ID:
```typescript
projectId: 'YOUR_PROJECT_ID'
```

## 📚 API Reference

### Smart Contract Functions

#### Public Functions
- `createSettlement()` - Create new settlement
- `depositFunds()` - Deposit settlement funds
- `addDocument()` - Add document hash
- `getSettlement()` - Get settlement details
- `getUserSettlements()` - Get user's settlements

#### Owner Functions
- `verifyParticipant()` - Verify KYC
- `updateSettlementStatus()` - Update status
- `releaseFunds()` - Release escrowed funds
- `pause()/unpause()` - Emergency controls

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the test files for usage examples

## 🔮 Future Enhancements

- **Multi-chain Support**: Deploy on multiple blockchains
- **Advanced Analytics**: Settlement analytics dashboard
- **Mobile App**: Native mobile application
- **Integration APIs**: Third-party legal software integration
- **Automated Compliance**: Regulatory compliance automation
- **AI Document Review**: Automated document analysis

---

Built with ❤️ for the legal technology community.