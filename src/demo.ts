import * as dotenv from 'dotenv';
import { SwapService } from './swapper';
import { COMMON_TOKENS, DEFAULT_SLIPPAGE, DEFAULT_DEADLINE } from './config';
import { SwapParams } from './types';

// Load environment variables
dotenv.config();

async function demonstrateSwap() {
  console.log('🚀 Uniswap Token Swap Demo\n');

  // Available chains for demo
  const availableChains = [
    { id: 1, name: 'Ethereum' },
    { id: 8453, name: 'Base' },
    { id: 42161, name: 'Arbitrum One' },
    { id: 56, name: 'BNB Smart Chain' },
  ];

  console.log('Available chains:');
  availableChains.forEach(chain => {
    console.log(`- ${chain.name} (Chain ID: ${chain.id})`);
  });
  console.log();

  // Demo configuration
  const chainId = 1; // Ethereum for demo
  const privateKey = process.env.PRIVATE_KEY;
  
  try {
    // Initialize swap service
    const swapService = new SwapService(chainId, privateKey);
    const config = swapService.getChainConfig();
    
    console.log(`🔗 Connected to ${config.name}`);
    console.log(`📡 RPC: ${config.rpcUrl}`);
    console.log(`🏦 Router: ${config.swapRouterAddress}`);
    console.log();

    // Get available tokens for the chain
    const tokens = COMMON_TOKENS[chainId];
    if (!tokens) {
      throw new Error(`No token configuration found for chain ID: ${chainId}`);
    }

    console.log('Available tokens:');
    Object.entries(tokens).forEach(([symbol, token]) => {
      console.log(`- ${token.name} (${symbol}): ${token.address}`);
    });
    console.log();

    // Demo wallet address (replace with actual address)
    const demoWalletAddress = '0x742d35Cc6634C0532925a3b8D4b3c8E5C3c8E5C3'; // Example address
    
    if (privateKey) {
      console.log('🔐 Private key detected - swap execution enabled');
    } else {
      console.log('⚠️  No private key - demo will show quotes only');
    }
    console.log();

    // Example 1: Get a quote for USDC -> WETH
    console.log('📊 Example 1: Getting quote for USDC -> WETH swap');
    try {
      const quote = await swapService.getQuote(
        tokens.USDC,
        tokens.WETH,
        '1000' // 1000 USDC
      );
      
      console.log(`💰 Input: 1000 ${tokens.USDC.symbol}`);
      console.log(`💰 Output: ${quote.amountOut} ${tokens.WETH.symbol}`);
      console.log(`⛽ Gas Estimate: ${quote.gasEstimate}`);
      console.log(`📈 Price Impact: ${quote.priceImpact}%`);
      console.log(`🛣️  Route: ${quote.route.join(' -> ')}`);
      console.log();
    } catch (error) {
      console.log(`❌ Quote failed: ${error}`);
      console.log();
    }

    // Example 2: Check token balance
    console.log('💼 Example 2: Checking token balances');
    try {
      const usdcBalance = await swapService.getTokenBalance(
        tokens.USDC.address,
        demoWalletAddress
      );
      const wethBalance = await swapService.getTokenBalance(
        tokens.WETH.address,
        demoWalletAddress
      );
      
      console.log(`💳 USDC Balance: ${usdcBalance} USDC`);
      console.log(`💳 WETH Balance: ${wethBalance} WETH`);
      console.log();
    } catch (error) {
      console.log(`❌ Balance check failed: ${error}`);
      console.log();
    }

    // Example 3: Check allowance
    console.log('🔓 Example 3: Checking token allowance');
    try {
      const allowance = await swapService.checkAllowance(
        tokens.USDC.address,
        demoWalletAddress,
        config.swapRouterAddress
      );
      
      console.log(`✅ USDC Allowance for Swap Router: ${allowance} USDC`);
      console.log();
    } catch (error) {
      console.log(`❌ Allowance check failed: ${error}`);
      console.log();
    }

    // Example 4: Execute swap (only if private key is provided)
    if (privateKey) {
      console.log('💱 Example 4: Executing token swap');
      console.log('⚠️  This would execute a real transaction!');
      console.log('🚫 Skipping execution in demo mode');
      
      // Uncomment below to execute actual swap (use with caution!)
      /*
      const swapParams: SwapParams = {
        tokenIn: tokens.USDC,
        tokenOut: tokens.WETH,
        amountIn: '100', // 100 USDC
        slippageTolerance: DEFAULT_SLIPPAGE,
        deadline: DEFAULT_DEADLINE,
        recipient: demoWalletAddress,
      };

      try {
        const result = await swapService.executeSwap(swapParams);
        console.log(`✅ Swap successful!`);
        console.log(`🔗 Transaction Hash: ${result.hash}`);
        console.log(`💰 Amount In: ${result.amountIn} ${tokens.USDC.symbol}`);
        console.log(`💰 Amount Out: ${result.amountOut} ${tokens.WETH.symbol}`);
        console.log(`⛽ Gas Used: ${result.gasUsed}`);
      } catch (error) {
        console.log(`❌ Swap failed: ${error}`);
      }
      */
    }

  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Multi-chain demo function
async function demonstrateMultiChain() {
  console.log('🌐 Multi-Chain Support Demo\n');

  const chains = [1, 8453, 42161]; // Ethereum, Base, Arbitrum

  for (const chainId of chains) {
    try {
      const swapService = new SwapService(chainId);
      const config = swapService.getChainConfig();
      const tokens = COMMON_TOKENS[chainId];

      console.log(`🔗 ${config.name} (Chain ID: ${chainId})`);
      console.log(`📡 RPC: ${config.rpcUrl}`);
      console.log(`🏦 Router: ${config.swapRouterAddress}`);
      
      if (tokens) {
        console.log('📋 Available tokens:');
        Object.keys(tokens).forEach(symbol => {
          console.log(`   - ${symbol}`);
        });
      }
      console.log();
    } catch (error) {
      console.log(`❌ Failed to initialize ${chainId}: ${error}\n`);
    }
  }
}

// Usage examples
async function showUsageExamples() {
  console.log('📚 Usage Examples\n');

  console.log('1. Basic Setup:');
  console.log('```typescript');
  console.log('import { SwapService } from "./swapper";');
  console.log('import { COMMON_TOKENS } from "./config";');
  console.log('');
  console.log('// Initialize for Ethereum');
  console.log('const swapService = new SwapService(1, "your_private_key");');
  console.log('```\n');

  console.log('2. Get Quote:');
  console.log('```typescript');
  console.log('const quote = await swapService.getQuote(');
  console.log('  COMMON_TOKENS[1].USDC,');
  console.log('  COMMON_TOKENS[1].WETH,');
  console.log('  "1000" // 1000 USDC');
  console.log(');');
  console.log('console.log(`Expected output: ${quote.amountOut} WETH`);');
  console.log('```\n');

  console.log('3. Execute Swap:');
  console.log('```typescript');
  console.log('const swapParams = {');
  console.log('  tokenIn: COMMON_TOKENS[1].USDC,');
  console.log('  tokenOut: COMMON_TOKENS[1].WETH,');
  console.log('  amountIn: "1000",');
  console.log('  slippageTolerance: 0.5, // 0.5%');
  console.log('  deadline: 1800, // 30 minutes');
  console.log('  recipient: "0x...", // Your wallet address');
  console.log('};');
  console.log('');
  console.log('const result = await swapService.executeSwap(swapParams);');
  console.log('console.log(`Transaction hash: ${result.hash}`);');
  console.log('```\n');

  console.log('4. Multi-chain usage:');
  console.log('```typescript');
  console.log('// Ethereum');
  console.log('const ethSwap = new SwapService(1, privateKey);');
  console.log('');
  console.log('// Base');
  console.log('const baseSwap = new SwapService(8453, privateKey);');
  console.log('');
  console.log('// Arbitrum');
  console.log('const arbSwap = new SwapService(42161, privateKey);');
  console.log('```\n');
}

// Main execution
async function main() {
  console.log('🦄 Uniswap Multi-Chain Token Swap Demo\n');
  console.log('=====================================\n');

  // Run demonstrations
  await demonstrateSwap();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await demonstrateMultiChain();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await showUsageExamples();

  console.log('⚠️  Important Notes:');
  console.log('- Always test on testnets first');
  console.log('- Set appropriate slippage tolerance');
  console.log('- Ensure sufficient token allowance');
  console.log('- Monitor gas prices for optimal execution');
  console.log('- Keep private keys secure');
}

// Run the demo
if (require.main === module) {
  main().catch(console.error);
} 