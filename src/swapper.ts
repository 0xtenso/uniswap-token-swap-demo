import { ethers } from 'ethers';
import { Token, CurrencyAmount, TradeType, Percent } from '@uniswap/sdk-core';
import { Route, Pool, FeeAmount, computePoolAddress } from '@uniswap/v3-sdk';
import { ChainConfig, SwapParams, SwapQuote, SwapResult } from './types';
import { CHAIN_CONFIGS } from './config';

// Minimal ABI for ERC20 and Uniswap contracts
const ERC20_ABI = [
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address, address) view returns (uint256)',
  'function approve(address, uint256) returns (bool)',
];

const QUOTER_ABI = [
  'function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)',
];

const POOL_ABI = [
  'function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
  'function liquidity() external view returns (uint128)',
  'function fee() external view returns (uint24)',
];

const SWAP_ROUTER_ABI = [
  'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)',
];

export class SwapService {
  private provider: ethers.JsonRpcProvider;
  private signer?: ethers.Wallet;
  private chainConfig: ChainConfig;

  constructor(chainId: number, privateKey?: string) {
    this.chainConfig = CHAIN_CONFIGS[chainId];
    if (!this.chainConfig) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }

    this.provider = new ethers.JsonRpcProvider(this.chainConfig.rpcUrl);
    
    if (privateKey) {
      this.signer = new ethers.Wallet(privateKey, this.provider);
    }
  }

  async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<string> {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
    const balance = await tokenContract.balanceOf(walletAddress);
    const decimals = await tokenContract.decimals();
    return ethers.formatUnits(balance, decimals);
  }

  async approveToken(tokenAddress: string, spenderAddress: string, amount: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer not initialized. Provide private key to constructor.');
    }

    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.signer);
    const decimals = await tokenContract.decimals();
    const amountWei = ethers.parseUnits(amount, decimals);
    
    const tx = await tokenContract.approve(spenderAddress, amountWei);
    await tx.wait();
    return tx.hash;
  }

  async getQuote(
    tokenIn: Token,
    tokenOut: Token,
    amountIn: string,
    fee: FeeAmount = FeeAmount.MEDIUM
  ): Promise<SwapQuote> {
    const quoterContract = new ethers.Contract(
      this.chainConfig.quoterAddress,
      QUOTER_ABI,
      this.provider
    );

    const amountInWei = ethers.parseUnits(amountIn, tokenIn.decimals);

    try {
      const quotedAmountOut = await quoterContract.quoteExactInputSingle.staticCall(
        tokenIn.address,
        tokenOut.address,
        fee,
        amountInWei,
        0 // sqrtPriceLimitX96 (0 = no limit)
      );

      const amountOut = ethers.formatUnits(quotedAmountOut, tokenOut.decimals);
      
      // Calculate price impact (simplified)
      const priceImpact = '0.1'; // This would need more complex calculation in production
      
      return {
        amountOut,
        gasEstimate: '150000', // Estimated gas
        priceImpact,
        route: [tokenIn.symbol!, tokenOut.symbol!],
      };
    } catch (error) {
      throw new Error(`Failed to get quote: ${error}`);
    }
  }

  async executeSwap(params: SwapParams): Promise<SwapResult> {
    if (!this.signer) {
      throw new Error('Signer not initialized. Provide private key to constructor.');
    }

    // Get quote first
    const quote = await this.getQuote(params.tokenIn, params.tokenOut, params.amountIn);
    
    // Calculate minimum amount out with slippage
    const amountOutMin = ethers.parseUnits(
      (parseFloat(quote.amountOut) * (1 - params.slippageTolerance / 100)).toString(),
      params.tokenOut.decimals
    );

    // Prepare swap parameters
    const swapParams = {
      tokenIn: params.tokenIn.address,
      tokenOut: params.tokenOut.address,
      fee: FeeAmount.MEDIUM,
      recipient: params.recipient,
      deadline: Math.floor(Date.now() / 1000) + params.deadline,
      amountIn: ethers.parseUnits(params.amountIn, params.tokenIn.decimals),
      amountOutMinimum: amountOutMin,
      sqrtPriceLimitX96: 0, // No price limit
    };

    // Execute the swap
    const swapRouter = new ethers.Contract(
      this.chainConfig.swapRouterAddress,
      SWAP_ROUTER_ABI,
      this.signer
    );

    const tx = await swapRouter.exactInputSingle(swapParams, {
      gasLimit: '300000',
    });

    const receipt = await tx.wait();

    return {
      hash: tx.hash,
      amountIn: params.amountIn,
      amountOut: quote.amountOut,
      gasUsed: receipt!.gasUsed.toString(),
    };
  }

  async checkAllowance(tokenAddress: string, ownerAddress: string, spenderAddress: string): Promise<string> {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
    const allowance = await tokenContract.allowance(ownerAddress, spenderAddress);
    const decimals = await tokenContract.decimals();
    return ethers.formatUnits(allowance, decimals);
  }

  getChainConfig(): ChainConfig {
    return this.chainConfig;
  }

  // Helper method to prepare swap data without executing
  async prepareSwapData(params: SwapParams): Promise<{
    to: string;
    data: string;
    value: string;
    gasEstimate: string;
  }> {
    const quote = await this.getQuote(params.tokenIn, params.tokenOut, params.amountIn);
    
    const amountOutMin = ethers.parseUnits(
      (parseFloat(quote.amountOut) * (1 - params.slippageTolerance / 100)).toString(),
      params.tokenOut.decimals
    );

    const swapInterface = new ethers.Interface(SWAP_ROUTER_ABI);
    
    const swapData = {
      tokenIn: params.tokenIn.address,
      tokenOut: params.tokenOut.address,
      fee: FeeAmount.MEDIUM,
      recipient: params.recipient,
      deadline: Math.floor(Date.now() / 1000) + params.deadline,
      amountIn: ethers.parseUnits(params.amountIn, params.tokenIn.decimals),
      amountOutMinimum: amountOutMin,
      sqrtPriceLimitX96: 0,
    };

    const calldata = swapInterface.encodeFunctionData('exactInputSingle', [swapData]);

    return {
      to: this.chainConfig.swapRouterAddress,
      data: calldata,
      value: '0',
      gasEstimate: quote.gasEstimate,
    };
  }
} 