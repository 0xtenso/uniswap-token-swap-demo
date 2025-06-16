# Uniswap Multi-Chain Token Swap DApp

A TypeScript-based decentralized application for swapping tokens across multiple EVM chains using the Uniswap V3 SDK.

## Features

🔗 **Multi-Chain Support**: Ethereum, Base, Arbitrum, BNB Smart Chain  
💱 **Token Swaps**: Support for all major tokens (ETH, WETH, USDC, USDT, DAI, etc.)  
⛽ **Gas Optimization**: Efficient gas usage with Uniswap V3  
🔐 **Secure**: Non-custodial swaps directly from your wallet  
📊 **Real-time Quotes**: Live pricing and slippage calculation  
🚀 **Easy Integration**: Simple API for developers  

## Supported Chains

| Chain | Chain ID | Status | Native Token |
|-------|----------|--------|--------------|
| Ethereum | 1 | ✅ | ETH |
| Base | 8453 | ✅ | ETH |
| Arbitrum One | 42161 | ✅ | ETH |
| BNB Smart Chain | 56 | ✅ | BNB |

## Quick Start

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env` file:

```env
# Optional: Add your private key for swap execution
PRIVATE_KEY=your_private_key_here

# Optional: Custom RPC URLs
ETHEREUM_RPC_URL=your_ethereum_rpc
BASE_RPC_URL=your_base_rpc
ARBITRUM_RPC_URL=your_arbitrum_rpc
BNB_RPC_URL=your_bnb_rpc
```

### Running Demos

```bash
# General multi-chain demo
npm run demo

# Base network specific demo (ETH ↔ USDT)
npm run demo-base

# Build only
npm run build
```

## Base Network Demo (ETH ↔ USDT)

The Base demo specifically demonstrates native ETH to USDT swaps:

### Features Demonstrated

✅ **ETH → USDT Swap Quotes**  
✅ **USDT → ETH Swap Quotes**  
✅ **Token Balance Checking**  
✅ **Allowance Management**  
✅ **Transaction Preparation**  
✅ **Real-time Exchange Rates**  

### Example Output

```
🟡 Base Network Token Swap Demo
==================================================
📍 Network: Base (Chain ID: 8453)
🔗 Native Token: ETH
💱 Demo Swaps: ETH ↔ USDT
==================================================

📊 Example 1: ETH → USDT Swap Quote
----------------------------------------
💰 Input: 0.1 ETH (Native)
💰 Expected Output: 254.32 USDT
⛽ Estimated Gas: 150000
📈 Price Impact: 0.1%
🛣️  Route: ETH → USDT
💱 Exchange Rate: 1 ETH = 2543.20 USDT
ℹ️  Note: ETH will be automatically wrapped to WETH during swap
```

### How It Works

1. **ETH Input**: You provide native ETH
2. **Auto-Wrapping**: ETH is automatically wrapped to WETH
3. **Uniswap Swap**: WETH is swapped to USDT via Uniswap V3
4. **Direct Delivery**: USDT is sent to your address

For the reverse (USDT → ETH):
1. **USDT Input**: You provide USDT (requires approval)
2. **Uniswap Swap**: USDT is swapped to WETH
3. **Auto-Unwrapping**: WETH is unwrapped to native ETH
4. **Direct Delivery**: ETH is sent to your address

## Usage Examples

### Getting a Quote

```typescript
import { SwapService } from './src/swapper';
import { COMMON_TOKENS } from './src/config';

// Initialize for Base network
const swapService = new SwapService(8453);
const tokens = COMMON_TOKENS[8453];

// Get ETH to USDT quote
const quote = await swapService.getEthToTokenQuote(
  tokens.USDT,
  '0.1' // 0.1 ETH
);

console.log(`1 ETH = ${quote.amountOut / 0.1} USDT`);
```

### Executing a Swap

```typescript
// Initialize with private key for execution
const swapService = new SwapService(8453, 'your_private_key');

// Execute ETH to USDT swap
const result = await swapService.executeEthToTokenSwap({
  tokenOut: tokens.USDT,
  amountIn: '0.1',
  slippageTolerance: 0.5, // 0.5%
  deadline: 1800, // 30 minutes
  recipient: 'your_wallet_address',
});

console.log(`Swap completed: ${result.hash}`);
```

### Checking Balances

```typescript
// Check ETH balance
const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
const ethBalance = await provider.getBalance('your_address');

// Check USDT balance
const usdtBalance = await swapService.getTokenBalance(
  tokens.USDT.address,
  'your_address'
);
```

## Token Addresses (Base Network)

| Token | Address | Decimals |
|-------|---------|----------|
| WETH | `0x4200000000000000000000000000000000000006` | 18 |
| USDC | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | 6 |
| USDT | `0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2` | 6 |
| DAI | `0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb` | 18 |

## Uniswap Contracts (Base)

| Contract | Address |
|----------|---------|
| Swap Router | `0x2626664c2603336E57B271c5C0b26F421741e481` |
| Quoter | `0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a` |

## Safety Guidelines

⚠️ **Important Notes:**

1. **Test First**: Always test with small amounts
2. **Slippage**: Set appropriate slippage tolerance (0.5-3%)
3. **Gas Fees**: Ensure sufficient ETH for gas
4. **Approvals**: USDT swaps require token approval first
5. **Private Keys**: Never share your private keys
6. **Testnet**: Use testnets for development

## Architecture

```
src/
├── types.ts          # TypeScript interfaces
├── config.ts         # Chain and token configurations
├── swapper.ts        # Core swap service
└── demo.ts           # Multi-chain demo

demo-base.ts          # Base-specific demo
```

## Dependencies

- `@uniswap/sdk-core`: Core Uniswap SDK
- `@uniswap/v3-sdk`: Uniswap V3 specific functionality
- `@uniswap/router-sdk`: Router SDK for swaps
- `ethers`: Ethereum library for blockchain interaction

## License

MIT

## Disclaimer

This software is provided for educational purposes. Always verify transactions and use at your own risk. The authors are not responsible for any financial losses. 