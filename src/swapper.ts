import { ethers } from 'ethers';
import { Token, CurrencyAmount, TradeType, Percent } from '@uniswap/sdk-core';
import { Route, Pool, FeeAmount, computePoolAddress } from '@uniswap/v3-sdk';
import { SwapRouter, SwapOptions } from '@uniswap/swap-router-sdk';
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

export class SwapService {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;
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
      const quotedAmountOut = await quoterContract.quoteExactInputSingle(
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
    
    // Create currency amounts
    const amountIn = CurrencyAmount.fromRawAmount(
      params.tokenIn,
      ethers.parseUnits(params.amountIn, params.tokenIn.decimals).toString()
    );
    
    const amountOutMin = CurrencyAmount.fromRawAmount(
      params.tokenOut,
      ethers.parseUnits(
        (parseFloat(quote.amountOut) * (1 - params.slippageTolerance / 100)).toString(),
        params.tokenOut.decimals
      ).toString()
    );

    // Create pool (simplified - in production you'd fetch actual pool data)
    const poolAddress = computePoolAddress({
      factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984', // V3 Factory
      tokenA: params.tokenIn,
      tokenB: params.tokenOut,
      fee: FeeAmount.MEDIUM,
    });

    // Get pool data
    const poolContract = new ethers.Contract(poolAddress, POOL_ABI, this.provider);
    const [slot0, liquidity] = await Promise.all([
      poolContract.slot0(),
      poolContract.liquidity(),
    ]);

    const pool = new Pool(
      params.tokenIn,
      params.tokenOut,
      FeeAmount.MEDIUM,
      slot0.sqrtPriceX96.toString(),
      liquidity.toString(),
      slot0.tick
    );

    const route = new Route([pool], params.tokenIn, params.tokenOut);

    // Create swap options
    const swapOptions: SwapOptions = {
      slippageTolerance: new Percent(Math.floor(params.slippageTolerance * 100), 10000),
      deadline: Math.floor(Date.now() / 1000) + params.deadline,
      recipient: params.recipient,
    };

    // Generate the swap call data
    const { calldata, value } = SwapRouter.swapCallParameters([{
      type: TradeType.EXACT_INPUT,
      route,
      inputAmount: amountIn,
      outputAmount: amountOutMin,
    }], swapOptions);

    // Execute the transaction
    const transaction = {
      to: this.chainConfig.swapRouterAddress,
      data: calldata,
      value: value,
      gasLimit: '300000',
    };

    const tx = await this.signer.sendTransaction(transaction);
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
} 