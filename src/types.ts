import { Token } from '@uniswap/sdk-core';

export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  swapRouterAddress: string;
  quoterAddress: string;
}

export interface SwapParams {
  tokenIn: Token;
  tokenOut: Token;
  amountIn: string;
  slippageTolerance: number;
  deadline: number;
  recipient: string;
}

export interface SwapQuote {
  amountOut: string;
  gasEstimate: string;
  priceImpact: string;
  route: string[];
}

export interface SwapResult {
  hash: string;
  amountIn: string;
  amountOut: string;
  gasUsed: string;
} 