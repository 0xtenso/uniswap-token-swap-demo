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
  'function quoteExactInputSingle((address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96)) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)',
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
      // Use struct-based parameters for QuoterV2
      const quoteParams = {
        tokenIn: tokenIn.address,
        tokenOut: tokenOut.address,
        fee: fee,
        amountIn: amountInWei,
        sqrtPriceLimitX96: 0 // no limit
      };

      const result = await quoterContract.quoteExactInputSingle.staticCall(quoteParams);
      
      // QuoterV2 returns [amountOut, sqrtPriceX96After, initializedTicksCrossed, gasEstimate]
      const [quotedAmountOut, , , gasEstimate] = result;

      const amountOut = ethers.formatUnits(quotedAmountOut, tokenOut.decimals);
      
      // Calculate price impact (simplified)
      const priceImpact = '0.1'; // This would need more complex calculation in production
      
      return {
        amountOut,
        gasEstimate: gasEstimate.toString(),
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

    // For ETH swaps, set the value to the amount being swapped
    const isEthIn = params.tokenIn.address.toLowerCase() === '0x4200000000000000000000000000000000000006'.toLowerCase();
    const value = isEthIn ? ethers.parseUnits(params.amountIn, 18).toString() : '0';

    return {
      to: this.chainConfig.swapRouterAddress,
      data: calldata,
      value,
      gasEstimate: quote.gasEstimate,
    };
  }

  // Helper method for ETH to Token swaps
  async getEthToTokenQuote(tokenOut: Token, ethAmount: string): Promise<SwapQuote> {
    // Use WETH for routing but present as ETH
    const wethToken = new Token(this.chainConfig.chainId, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether');
    return this.getQuote(wethToken, tokenOut, ethAmount);
  }

  // Helper method for Token to ETH swaps
  async getTokenToEthQuote(tokenIn: Token, tokenAmount: string): Promise<SwapQuote> {
    // Use WETH for routing but present as ETH
    const wethToken = new Token(this.chainConfig.chainId, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether');
    return this.getQuote(tokenIn, wethToken, tokenAmount);
  }

  // Helper method for ETH to Token swaps execution
  async executeEthToTokenSwap(params: Omit<SwapParams, 'tokenIn'> & { tokenOut: Token }): Promise<SwapResult> {
    if (!this.signer) {
      throw new Error('Signer not initialized. Provide private key to constructor.');
    }

    // Use WETH for the swap
    const wethToken = new Token(this.chainConfig.chainId, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether');
    
    const swapParams: SwapParams = {
      tokenIn: wethToken,
      tokenOut: params.tokenOut,
      amountIn: params.amountIn,
      slippageTolerance: params.slippageTolerance,
      deadline: params.deadline,
      recipient: params.recipient,
    };

    // Get quote first
    const quote = await this.getQuote(swapParams.tokenIn, swapParams.tokenOut, swapParams.amountIn);
    
    // Calculate minimum amount out with slippage
    const amountOutMin = ethers.parseUnits(
      (parseFloat(quote.amountOut) * (1 - swapParams.slippageTolerance / 100)).toString(),
      swapParams.tokenOut.decimals
    );

    // Prepare swap parameters
    const swapData = {
      tokenIn: swapParams.tokenIn.address,
      tokenOut: swapParams.tokenOut.address,
      fee: FeeAmount.MEDIUM,
      recipient: swapParams.recipient,
      deadline: Math.floor(Date.now() / 1000) + swapParams.deadline,
      amountIn: ethers.parseUnits(swapParams.amountIn, swapParams.tokenIn.decimals),
      amountOutMinimum: amountOutMin,
      sqrtPriceLimitX96: 0,
    };

    // Execute the swap with ETH value
    const swapRouter = new ethers.Contract(
      this.chainConfig.swapRouterAddress,
      SWAP_ROUTER_ABI,
      this.signer
    );

    const tx = await swapRouter.exactInputSingle(swapData, {
      gasLimit: '300000',
      value: ethers.parseUnits(swapParams.amountIn, 18), // Send ETH with transaction
    });

    const receipt = await tx.wait();

    return {
      hash: tx.hash,
      amountIn: swapParams.amountIn,
      amountOut: quote.amountOut,
      gasUsed: receipt!.gasUsed.toString(),
    };
  }

  // Helper method for Token to ETH swaps execution
  async executeTokenToEthSwap(params: Omit<SwapParams, 'tokenOut'> & { tokenIn: Token }): Promise<SwapResult> {
    if (!this.signer) {
      throw new Error('Signer not initialized. Provide private key to constructor.');
    }

    // Use WETH for the swap
    const wethToken = new Token(this.chainConfig.chainId, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether');
    
    const swapParams: SwapParams = {
      tokenIn: params.tokenIn,
      tokenOut: wethToken,
      amountIn: params.amountIn,
      slippageTolerance: params.slippageTolerance,
      deadline: params.deadline,
      recipient: params.recipient,
    };

    return this.executeSwap(swapParams);
  }
} 