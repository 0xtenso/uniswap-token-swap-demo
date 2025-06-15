# Uniswap Token Swap Demo

A TypeScript implementation of token swapping using the Uniswap SDK, supporting multiple EVM chains including Ethereum, Base, Arbitrum, and BNB Smart Chain.

## Features

- 🌐 Multi-chain support (Ethereum, Base, Arbitrum, BSC)
- 💱 Token-to-token swaps using Uniswap V3
- 📊 Price quotes and slippage protection
- ⛽ Gas estimation
- 🔐 Secure transaction handling
- 📝 TypeScript support with full type safety

## Supported Chains

| Chain | Chain ID | Native Currency | Status |
|-------|----------|----------------|---------|
| Ethereum | 1 | ETH | ✅ |
| Base | 8453 | ETH | ✅ |
| Arbitrum One | 42161 | ETH | ✅ |
| BNB Smart Chain | 56 | BNB | ✅ |

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd uniswap-token-swap-demo
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
# RPC URLs (get from Alchemy, Infura, or public endpoints)
ETHEREUM_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/YOUR_API_KEY
BASE_RPC_URL=https://mainnet.base.org
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
BNB_RPC_URL=https://bsc-dataseed.binance.org

# Private key for transactions (optional, for quotes only)
PRIVATE_KEY=your_private_key_here
```

## Usage

### Build the project:
```bash
npm run build
```

### Run the demo:
```bash
npm run dev
```

### Basic Usage Example

```typescript
import { SwapService } from './src/swapper';
import { COMMON_TOKENS } from './src/config';

// Initialize swap service for Ethereum
const swapService = new SwapService(1, process.env.PRIVATE_KEY);

// Get a quote
const quote = await swapService.getQuote(
  COMMON_TOKENS[1].USDC,
  COMMON_TOKENS[1].WETH,
  '1000' // 1000 USDC
);

console.log(`Expected output: ${quote.amountOut} WETH`);

// Execute swap
const swapParams = {
  tokenIn: COMMON_TOKENS[1].USDC,
  tokenOut: COMMON_TOKENS[1].WETH,
  amountIn: '1000',
  slippageTolerance: 0.5, // 0.5%
  deadline: 1800, // 30 minutes
  recipient: '0x...', // Your wallet address
};

const result = await swapService.executeSwap(swapParams);
console.log(`Transaction hash: ${result.hash}`);
```

### Multi-Chain Usage

```typescript
// Different chains
const ethSwap = new SwapService(1, privateKey);     // Ethereum
const baseSwap = new SwapService(8453, privateKey);  // Base
const arbSwap = new SwapService(42161, privateKey);  // Arbitrum
const bscSwap = new SwapService(56, privateKey);     // BSC

// Each service works the same way
const ethQuote = await ethSwap.getQuote(/*...*/);
const baseQuote = await baseSwap.getQuote(/*...*/);
```

## API Reference

### SwapService

#### Constructor
```typescript
new SwapService(chainId: number, privateKey?: string)
```

#### Methods

##### `getQuote(tokenIn, tokenOut, amountIn, fee?)`
Get a price quote for a token swap.

- `tokenIn`: Input token
- `tokenOut`: Output token  
- `amountIn`: Amount to swap (in token units)
- `fee`: Pool fee tier (optional, defaults to MEDIUM)

Returns: `SwapQuote` object with expected output amount

##### `executeSwap(params)`
Execute a token swap transaction.

- `params`: SwapParams object with swap details

Returns: `SwapResult` object with transaction details

##### `getTokenBalance(tokenAddress, walletAddress)`
Get token balance for a wallet.

##### `checkAllowance(tokenAddress, ownerAddress, spenderAddress)`
Check token allowance for spending.

##### `approveToken(tokenAddress, spenderAddress, amount)`
Approve token spending (requires private key).

## Common Tokens

The demo includes pre-configured token addresses for each supported chain:

### Ethereum (Chain ID: 1)
- WETH: Wrapped Ether
- USDC: USD Coin
- USDT: Tether USD
- DAI: Dai Stablecoin

### Base (Chain ID: 8453)
- WETH: Wrapped Ether
- USDC: USD Coin
- DAI: Dai Stablecoin

### Arbitrum (Chain ID: 42161)
- WETH: Wrapped Ether
- USDC: USD Coin
- USDT: Tether USD
- DAI: Dai Stablecoin

### BSC (Chain ID: 56)
- WBNB: Wrapped BNB
- USDC: USD Coin
- USDT: Tether USD
- BUSD: Binance USD

## Security Considerations

⚠️ **Important Security Notes:**

1. **Never commit private keys** to version control
2. **Test on testnets** first before mainnet
3. **Use hardware wallets** for production
4. **Set appropriate slippage** to avoid MEV attacks
5. **Monitor gas prices** for optimal transaction timing
6. **Verify token addresses** before swapping

## Error Handling

The service includes comprehensive error handling for:
- Network connectivity issues
- Insufficient balances
- Slippage exceeded
- Transaction failures
- Invalid token addresses

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Disclaimer

This is a demo implementation for educational purposes. Always conduct thorough testing and security audits before using in production. The authors are not responsible for any financial losses.

## Support

For questions and support:
- Check the demo code in `src/demo.ts`
- Review the API documentation above
- Test with small amounts first
- Use testnets for development

## Resources

- [Uniswap V3 SDK Documentation](https://docs.uniswap.org/sdk/v3/overview)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Uniswap Protocol](https://uniswap.org/) 