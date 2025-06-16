import * as dotenv from 'dotenv';
import { SwapService } from './swapper';
import { COMMON_TOKENS, DEFAULT_SLIPPAGE, DEFAULT_DEADLINE } from './config';
import { SwapParams } from './types';
import { Token } from '@uniswap/sdk-core';

// Load environment variables
dotenv.config();

async function demonstrateBaseSwaps() {
  console.log('🟡 Base Network Token Swap Demo\n');
  console.log('='.repeat(50));
  console.log('📍 Network: Base (Chain ID: 8453)');
  console.log('🔗 Native Token: ETH');
  console.log('💱 Demo Swaps: ETH ↔ USDT');
  console.log('='.repeat(50));
  console.log();

  // Base configuration
  const chainId = 8453; // Base
  const privateKey = process.env.PRIVATE_KEY;
  
  try {
    // Initialize swap service for Base
    const swapService = new SwapService(chainId, privateKey);
    const config = swapService.getChainConfig();
    
    console.log('🔧 Base Network Configuration:');
    console.log(`📡 RPC URL: ${config.rpcUrl}`);
    console.log(`🏦 Swap Router: ${config.swapRouterAddress}`);
    console.log(`📊 Quoter: ${config.quoterAddress}`);
    console.log(`💰 Native Currency: ${config.nativeCurrency.name} (${config.nativeCurrency.symbol})`);
    console.log();

    // Get Base tokens
    const tokens = COMMON_TOKENS[chainId];
    if (!tokens) {
      throw new Error(`No token configuration found for Base (Chain ID: ${chainId})`);
    }

    console.log('🪙 Available Tokens on Base:');
    Object.entries(tokens).forEach(([symbol, token]) => {
      const typedToken = token as Token;
      console.log(`  ${symbol.padEnd(6)} | ${(typedToken.name || 'Unknown').padEnd(20)} | ${typedToken.address}`);
    });
    console.log('  ETH    | Ether (Native)       | Native Token');
    console.log();

    // Demo wallet address
    const demoWalletAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // Example address
    
    // Show execution mode
    if (privateKey) {
      console.log('🔐 Private key detected - swap execution enabled');
      console.log('⚠️  Use with caution in production!');
    } else {
      console.log('🔍 Demo mode - showing quotes and simulations only');
      console.log('💡 Set PRIVATE_KEY environment variable to enable execution');
    }
    console.log();

    // ===========================================
    // Example 1: ETH to USDT Swap Quote
    // ===========================================
    console.log('📊 Example 1: ETH → USDT Swap Quote');
    console.log('-'.repeat(40));
    
    try {
      const ethAmount = '0.1'; // 0.1 ETH
      // Use the new helper method for ETH to token quotes
      const quote1 = await swapService.getEthToTokenQuote(tokens.USDT, ethAmount);
      
      console.log(`💰 Input: ${ethAmount} ETH (Native)`);
      console.log(`💰 Expected Output: ${quote1.amountOut} USDT`);
      console.log(`⛽ Estimated Gas: ${quote1.gasEstimate}`);
      console.log(`📈 Price Impact: ${quote1.priceImpact}%`);
      console.log(`🛣️  Route: ETH → ${quote1.route.slice(1).join(' → ')}`); // Remove WETH from display
      
      // Calculate rate
      const rate1 = parseFloat(quote1.amountOut) / parseFloat(ethAmount);
      console.log(`💱 Exchange Rate: 1 ETH = ${rate1.toFixed(2)} USDT`);
      console.log('ℹ️  Note: ETH will be automatically wrapped to WETH during swap');
      console.log();
    } catch (error) {
      console.log(`❌ ETH → USDT quote failed: ${error}`);
      console.log();
    }

    // ===========================================
    // Example 2: USDT to ETH Swap Quote
    // ===========================================
    console.log('📊 Example 2: USDT → ETH Swap Quote');
    console.log('-'.repeat(40));
    
    try {
      const usdtAmount = '100'; // 100 USDT
      // Use the new helper method for token to ETH quotes
      const quote2 = await swapService.getTokenToEthQuote(tokens.USDT, usdtAmount);
      
      console.log(`💰 Input: ${usdtAmount} USDT`);
      console.log(`💰 Expected Output: ${quote2.amountOut} ETH (Native)`);
      console.log(`⛽ Estimated Gas: ${quote2.gasEstimate}`);
      console.log(`📈 Price Impact: ${quote2.priceImpact}%`);
      console.log(`🛣️  Route: ${quote2.route.slice(0, -1).join(' → ')} → ETH`); // Remove WETH from display
      
      // Calculate rate
      const rate2 = parseFloat(usdtAmount) / parseFloat(quote2.amountOut);
      console.log(`💱 Exchange Rate: 1 ETH = ${rate2.toFixed(2)} USDT`);
      console.log('ℹ️  Note: WETH will be automatically unwrapped to ETH after swap');
      console.log();
    } catch (error) {
      console.log(`❌ USDT → ETH quote failed: ${error}`);
      console.log();
    }

    // ===========================================
    // Example 3: Check Token Balances
    // ===========================================
    console.log('💼 Example 3: Token Balance Check');
    console.log('-'.repeat(40));
    
    try {
      // Check native ETH balance
      const provider = swapService['provider']; // Access private provider
      const ethBalance = await provider.getBalance(demoWalletAddress);
      const ethBalanceFormatted = (parseFloat(ethBalance.toString()) / 1e18).toFixed(6);
      
      const wethBalance = await swapService.getTokenBalance(
        tokens.WETH.address,
        demoWalletAddress
      );
      const usdtBalance = await swapService.getTokenBalance(
        tokens.USDT.address,
        demoWalletAddress
      );
      const usdcBalance = await swapService.getTokenBalance(
        tokens.USDC.address,
        demoWalletAddress
      );
      
      console.log(`📊 Address: ${demoWalletAddress}`);
      console.log(`💳 ETH Balance: ${ethBalanceFormatted} ETH (Native)`);
      console.log(`💳 WETH Balance: ${wethBalance} WETH (Wrapped)`);
      console.log(`💳 USDT Balance: ${usdtBalance} USDT`);
      console.log(`💳 USDC Balance: ${usdcBalance} USDC`);
      console.log();
    } catch (error) {
      console.log(`❌ Balance check failed: ${error}`);
      console.log();
    }

    // ===========================================
    // Example 4: Check Token Allowances (Skip for ETH)
    // ===========================================
    console.log('🔓 Example 4: Token Allowance Check');
    console.log('-'.repeat(40));
    
    try {
      const usdtAllowance = await swapService.checkAllowance(
        tokens.USDT.address,
        demoWalletAddress,
        config.swapRouterAddress
      );
      
      console.log(`ℹ️  ETH Allowance: Not required (native token)`);
      console.log(`✅ USDT Allowance: ${usdtAllowance} USDT`);
      console.log(`🏦 Spender: ${config.swapRouterAddress}`);
      console.log('💡 Note: ETH doesn\'t require approval, only ERC20 tokens do');
      console.log();
    } catch (error) {
      console.log(`❌ Allowance check failed: ${error}`);
      console.log();
    }

    // ===========================================
    // Example 5: Prepare ETH to USDT Swap Data
    // ===========================================
    console.log('🔧 Example 5: Prepare ETH → USDT Swap Transaction');
    console.log('-'.repeat(40));
    
    try {
      const swapParams: SwapParams = {
        tokenIn: tokens.WETH, // Use WETH internally for ETH swaps
        tokenOut: tokens.USDT,
        amountIn: '0.05',
        slippageTolerance: DEFAULT_SLIPPAGE,
        deadline: DEFAULT_DEADLINE,
        recipient: demoWalletAddress,
      };

      const swapData = await swapService.prepareSwapData(swapParams);
      
      console.log(`📄 Transaction prepared for: ${swapParams.amountIn} ETH → USDT`);
      console.log(`🎯 Target Contract: ${swapData.to}`);
      console.log(`⛽ Gas Estimate: ${swapData.gasEstimate}`);
      console.log(`💰 ETH Value Required: ${swapParams.amountIn} ETH (for swap) + gas fees`);
      console.log(`📝 Calldata Length: ${swapData.data.length} bytes`);
      console.log('ℹ️  This transaction will:');
      console.log('   1. Take your ETH');
      console.log('   2. Wrap it to WETH automatically');
      console.log('   3. Swap WETH to USDT');
      console.log('   4. Send USDT to your address');
      console.log();
    } catch (error) {
      console.log(`❌ Swap preparation failed: ${error}`);
      console.log();
    }

    // ===========================================
    // Example 6: Prepare USDT to ETH Swap Data
    // ===========================================
    console.log('🔧 Example 6: Prepare USDT → ETH Swap Transaction');
    console.log('-'.repeat(40));
    
    try {
      const swapParams: SwapParams = {
        tokenIn: tokens.USDT,
        tokenOut: tokens.WETH, // Use WETH internally for ETH swaps
        amountIn: '50',
        slippageTolerance: DEFAULT_SLIPPAGE,
        deadline: DEFAULT_DEADLINE,
        recipient: demoWalletAddress,
      };

      const swapData = await swapService.prepareSwapData(swapParams);
      
      console.log(`📄 Transaction prepared for: ${swapParams.amountIn} USDT → ETH`);
      console.log(`🎯 Target Contract: ${swapData.to}`);
      console.log(`⛽ Gas Estimate: ${swapData.gasEstimate}`);
      console.log(`💰 ETH Value: ${swapData.value} (only for gas)`);
      console.log(`📝 Calldata Length: ${swapData.data.length} bytes`);
      console.log('ℹ️  This transaction will:');
      console.log('   1. Take your USDT (requires approval first)');
      console.log('   2. Swap USDT to WETH');
      console.log('   3. Unwrap WETH to ETH automatically');
      console.log('   4. Send ETH to your address');
      console.log();
    } catch (error) {
      console.log(`❌ Swap preparation failed: ${error}`);
      console.log();
    }

    // ===========================================
    // Example 7: Real Swap Execution Instructions
    // ===========================================
    if (privateKey) {
      console.log('💱 Example 7: Execute Real Swap');
      console.log('-'.repeat(40));
      console.log('⚠️  This would execute a REAL transaction on Base network!');
      console.log('🚫 Execution disabled in demo mode for safety');
      console.log();
      console.log('📋 To execute real swaps:');
      console.log('1. 💰 For ETH → USDT:');
      console.log('   - Ensure you have enough ETH (amount + gas)');
      console.log('   - No approval needed');
      console.log('   - Call executeSwap with WETH as tokenIn');
      console.log();
      console.log('2. 💰 For USDT → ETH:');
      console.log('   - Ensure you have USDT balance');
      console.log('   - Approve USDT first: swapService.approveToken(...)');
      console.log('   - Call executeSwap with WETH as tokenOut');
      console.log();
    }

  } catch (error) {
    console.error('❌ Base demo failed:', error);
  }
}

// ===========================================
// Additional Utility Functions
// ===========================================
async function showBaseTokenInfo() {
  console.log('\n📋 Base Network Token Information');
  console.log('='.repeat(50));
  
  const tokens = COMMON_TOKENS[8453];
  
  for (const [symbol, token] of Object.entries(tokens)) {
    const typedToken = token as Token;
    console.log(`${symbol}:`);
    console.log(`  Name: ${typedToken.name || 'Unknown'}`);
    console.log(`  Address: ${typedToken.address}`);
    console.log(`  Decimals: ${typedToken.decimals}`);
    console.log(`  Explorer: https://basescan.org/token/${typedToken.address}`);
    console.log();
  }
}

async function showSwapInstructions() {
  console.log('\n📚 How to Use This Demo');
  console.log('='.repeat(50));
  
  console.log('1. 🔧 Setup:');
  console.log('   - Add your private key to .env file: PRIVATE_KEY=your_key_here');
  console.log('   - Ensure you have ETH on Base network for gas fees');
  console.log('   - Get some tokens (WETH, USDT) for testing swaps');
  console.log();
  
  console.log('2. 💰 Getting Test Tokens:');
  console.log('   - Bridge ETH from Ethereum to Base using https://bridge.base.org');
  console.log('   - Wrap ETH to WETH on Base');
  console.log('   - Buy USDT using DEX like Uniswap on Base');
  console.log();
  
  console.log('3. 🚀 Running Swaps:');
  console.log('   - This demo shows quotes and balance checks');
  console.log('   - Uncomment execution code to run real swaps');
  console.log('   - Always test with small amounts first');
  console.log();
  
  console.log('4. 🔍 Monitoring:');
  console.log('   - View transactions on BaseScan: https://basescan.org');
  console.log('   - Check your wallet balance after swaps');
  console.log('   - Monitor gas prices for optimal execution');
  console.log();
  
  console.log('5. ⚠️  Important Notes:');
  console.log('   - Always approve tokens before swapping');
  console.log('   - Set appropriate slippage tolerance');
  console.log('   - Keep some ETH for gas fees');
  console.log('   - Test on testnet first if possible');
}

// ===========================================
// Main Execution
// ===========================================
async function main() {
  console.log('🟡 Base Network Uniswap Token Swap Demo');
  console.log('🔗 https://base.org | Chain ID: 8453');
  console.log('='.repeat(60));
  console.log();

  // Run the main demo
  await demonstrateBaseSwaps();
  
  // Show additional information
  await showBaseTokenInfo();
  await showSwapInstructions();

  console.log('\n🎉 Demo completed! Ready to swap on Base network.');
  console.log('💙 Happy swapping on Base! 🟡');
}

// Run the demo
if (require.main === module) {
  main().catch(console.error);
}

export { demonstrateBaseSwaps, showBaseTokenInfo, showSwapInstructions };