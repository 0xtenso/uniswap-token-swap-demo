"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_DEADLINE = exports.DEFAULT_SLIPPAGE = exports.COMMON_TOKENS = exports.CHAIN_CONFIGS = void 0;
var sdk_core_1 = require("@uniswap/sdk-core");
exports.CHAIN_CONFIGS = {
    // Ethereum Mainnet
    1: {
        chainId: 1,
        name: 'Ethereum',
        rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com',
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
        },
        swapRouterAddress: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
        quoterAddress: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
    },
    // Base
    8453: {
        chainId: 8453,
        name: 'Base',
        rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
        },
        swapRouterAddress: '0x2626664c2603336E57B271c5C0b26F421741e481',
        quoterAddress: '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a',
    },
    // Arbitrum One
    42161: {
        chainId: 42161,
        name: 'Arbitrum One',
        rpcUrl: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
        },
        swapRouterAddress: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
        quoterAddress: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
    },
    // BNB Smart Chain
    56: {
        chainId: 56,
        name: 'BNB Smart Chain',
        rpcUrl: process.env.BNB_RPC_URL || 'https://bsc-dataseed.binance.org',
        nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18,
        },
        swapRouterAddress: '0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2',
        quoterAddress: '0x78D78E420Da98ad378D7799bE8f4AF69033EB077',
    },
};
// Common token addresses for each chain
exports.COMMON_TOKENS = {
    1: {
        WETH: new sdk_core_1.Token(1, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped Ether'),
        USDC: new sdk_core_1.Token(1, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin'),
        USDT: new sdk_core_1.Token(1, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD'),
        DAI: new sdk_core_1.Token(1, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin'),
    },
    8453: {
        WETH: new sdk_core_1.Token(8453, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether'),
        USDC: new sdk_core_1.Token(8453, '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 6, 'USDC', 'USD Coin'),
        USDT: new sdk_core_1.Token(8453, '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', 6, 'USDT', 'Tether USD'),
        DAI: new sdk_core_1.Token(8453, '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', 18, 'DAI', 'Dai Stablecoin'),
    },
    42161: {
        WETH: new sdk_core_1.Token(42161, '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', 18, 'WETH', 'Wrapped Ether'),
        USDC: new sdk_core_1.Token(42161, '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', 6, 'USDC', 'USD Coin'),
        USDT: new sdk_core_1.Token(42161, '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', 6, 'USDT', 'Tether USD'),
        DAI: new sdk_core_1.Token(42161, '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', 18, 'DAI', 'Dai Stablecoin'),
    },
    56: {
        WBNB: new sdk_core_1.Token(56, '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', 18, 'WBNB', 'Wrapped BNB'),
        USDC: new sdk_core_1.Token(56, '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', 18, 'USDC', 'USD Coin'),
        USDT: new sdk_core_1.Token(56, '0x55d398326f99059fF775485246999027B3197955', 18, 'USDT', 'Tether USD'),
        BUSD: new sdk_core_1.Token(56, '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', 18, 'BUSD', 'Binance USD'),
    },
};
exports.DEFAULT_SLIPPAGE = 0.5; // 0.5%
exports.DEFAULT_DEADLINE = 1800; // 30 minutes 
