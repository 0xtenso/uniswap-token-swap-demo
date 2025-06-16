"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.demonstrateBaseSwaps = demonstrateBaseSwaps;
exports.showBaseTokenInfo = showBaseTokenInfo;
exports.showSwapInstructions = showSwapInstructions;
var dotenv = require("dotenv");
var swapper_1 = require("./src/swapper");
var config_1 = require("./src/config");
// Load environment variables
dotenv.config();
function demonstrateBaseSwaps() {
    return __awaiter(this, void 0, void 0, function () {
        var chainId, privateKey, swapService, config, tokens, demoWalletAddress, ethAmount, quote1, rate1, error_1, usdtAmount, quote2, rate2, error_2, provider, ethBalance, ethBalanceFormatted, wethBalance, usdtBalance, usdcBalance, error_3, usdtAllowance, error_4, swapParams, swapData, error_5, swapParams, swapData, error_6, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🟡 Base Network Token Swap Demo\n');
                    console.log('='.repeat(50));
                    console.log('📍 Network: Base (Chain ID: 8453)');
                    console.log('🔗 Native Token: ETH');
                    console.log('💱 Demo Swaps: ETH ↔ USDT');
                    console.log('='.repeat(50));
                    console.log();
                    chainId = 8453;
                    privateKey = process.env.PRIVATE_KEY;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 29, , 30]);
                    swapService = new swapper_1.SwapService(chainId, privateKey);
                    config = swapService.getChainConfig();
                    console.log('🔧 Base Network Configuration:');
                    console.log("\uD83D\uDCE1 RPC URL: ".concat(config.rpcUrl));
                    console.log("\uD83C\uDFE6 Swap Router: ".concat(config.swapRouterAddress));
                    console.log("\uD83D\uDCCA Quoter: ".concat(config.quoterAddress));
                    console.log("\uD83D\uDCB0 Native Currency: ".concat(config.nativeCurrency.name, " (").concat(config.nativeCurrency.symbol, ")"));
                    console.log();
                    tokens = config_1.COMMON_TOKENS[chainId];
                    if (!tokens) {
                        throw new Error("No token configuration found for Base (Chain ID: ".concat(chainId, ")"));
                    }
                    console.log('🪙 Available Tokens on Base:');
                    Object.entries(tokens).forEach(function (_a) {
                        var symbol = _a[0], token = _a[1];
                        console.log("  ".concat(symbol.padEnd(6), " | ").concat((token.name || 'Unknown').padEnd(20), " | ").concat(token.address));
                    });
                    console.log('  ETH    | Ether (Native)       | Native Token');
                    console.log();
                    demoWalletAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
                    // Show execution mode
                    if (privateKey) {
                        console.log('🔐 Private key detected - swap execution enabled');
                        console.log('⚠️  Use with caution in production!');
                    }
                    else {
                        console.log('🔍 Demo mode - showing quotes and simulations only');
                        console.log('💡 Set PRIVATE_KEY environment variable to enable execution');
                    }
                    console.log();
                    // ===========================================
                    // Example 1: ETH to USDT Swap Quote
                    // ===========================================
                    console.log('📊 Example 1: ETH → USDT Swap Quote');
                    console.log('-'.repeat(40));
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    ethAmount = '0.1';
                    return [4 /*yield*/, swapService.getEthToTokenQuote(tokens.USDT, ethAmount)];
                case 3:
                    quote1 = _a.sent();
                    console.log("\uD83D\uDCB0 Input: ".concat(ethAmount, " ETH (Native)"));
                    console.log("\uD83D\uDCB0 Expected Output: ".concat(quote1.amountOut, " USDT"));
                    console.log("\u26FD Estimated Gas: ".concat(quote1.gasEstimate));
                    console.log("\uD83D\uDCC8 Price Impact: ".concat(quote1.priceImpact, "%"));
                    console.log("\uD83D\uDEE3\uFE0F  Route: ETH \u2192 ".concat(quote1.route.slice(1).join(' → '))); // Remove WETH from display
                    rate1 = parseFloat(quote1.amountOut) / parseFloat(ethAmount);
                    console.log("\uD83D\uDCB1 Exchange Rate: 1 ETH = ".concat(rate1.toFixed(2), " USDT"));
                    console.log('ℹ️  Note: ETH will be automatically wrapped to WETH during swap');
                    console.log();
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.log("\u274C ETH \u2192 USDT quote failed: ".concat(error_1));
                    console.log();
                    return [3 /*break*/, 5];
                case 5:
                    // ===========================================
                    // Example 2: USDT to ETH Swap Quote
                    // ===========================================
                    console.log('📊 Example 2: USDT → ETH Swap Quote');
                    console.log('-'.repeat(40));
                    _a.label = 6;
                case 6:
                    _a.trys.push([6, 8, , 9]);
                    usdtAmount = '100';
                    return [4 /*yield*/, swapService.getTokenToEthQuote(tokens.USDT, usdtAmount)];
                case 7:
                    quote2 = _a.sent();
                    console.log("\uD83D\uDCB0 Input: ".concat(usdtAmount, " USDT"));
                    console.log("\uD83D\uDCB0 Expected Output: ".concat(quote2.amountOut, " ETH (Native)"));
                    console.log("\u26FD Estimated Gas: ".concat(quote2.gasEstimate));
                    console.log("\uD83D\uDCC8 Price Impact: ".concat(quote2.priceImpact, "%"));
                    console.log("\uD83D\uDEE3\uFE0F  Route: ".concat(quote2.route.slice(0, -1).join(' → '), " \u2192 ETH")); // Remove WETH from display
                    rate2 = parseFloat(usdtAmount) / parseFloat(quote2.amountOut);
                    console.log("\uD83D\uDCB1 Exchange Rate: 1 ETH = ".concat(rate2.toFixed(2), " USDT"));
                    console.log('ℹ️  Note: WETH will be automatically unwrapped to ETH after swap');
                    console.log();
                    return [3 /*break*/, 9];
                case 8:
                    error_2 = _a.sent();
                    console.log("\u274C USDT \u2192 ETH quote failed: ".concat(error_2));
                    console.log();
                    return [3 /*break*/, 9];
                case 9:
                    // ===========================================
                    // Example 3: Check Token Balances
                    // ===========================================
                    console.log('💼 Example 3: Token Balance Check');
                    console.log('-'.repeat(40));
                    _a.label = 10;
                case 10:
                    _a.trys.push([10, 15, , 16]);
                    provider = swapService['provider'];
                    return [4 /*yield*/, provider.getBalance(demoWalletAddress)];
                case 11:
                    ethBalance = _a.sent();
                    ethBalanceFormatted = (parseFloat(ethBalance.toString()) / 1e18).toFixed(6);
                    return [4 /*yield*/, swapService.getTokenBalance(tokens.WETH.address, demoWalletAddress)];
                case 12:
                    wethBalance = _a.sent();
                    return [4 /*yield*/, swapService.getTokenBalance(tokens.USDT.address, demoWalletAddress)];
                case 13:
                    usdtBalance = _a.sent();
                    return [4 /*yield*/, swapService.getTokenBalance(tokens.USDC.address, demoWalletAddress)];
                case 14:
                    usdcBalance = _a.sent();
                    console.log("\uD83D\uDCCA Address: ".concat(demoWalletAddress));
                    console.log("\uD83D\uDCB3 ETH Balance: ".concat(ethBalanceFormatted, " ETH (Native)"));
                    console.log("\uD83D\uDCB3 WETH Balance: ".concat(wethBalance, " WETH (Wrapped)"));
                    console.log("\uD83D\uDCB3 USDT Balance: ".concat(usdtBalance, " USDT"));
                    console.log("\uD83D\uDCB3 USDC Balance: ".concat(usdcBalance, " USDC"));
                    console.log();
                    return [3 /*break*/, 16];
                case 15:
                    error_3 = _a.sent();
                    console.log("\u274C Balance check failed: ".concat(error_3));
                    console.log();
                    return [3 /*break*/, 16];
                case 16:
                    // ===========================================
                    // Example 4: Check Token Allowances (Skip for ETH)
                    // ===========================================
                    console.log('🔓 Example 4: Token Allowance Check');
                    console.log('-'.repeat(40));
                    _a.label = 17;
                case 17:
                    _a.trys.push([17, 19, , 20]);
                    return [4 /*yield*/, swapService.checkAllowance(tokens.USDT.address, demoWalletAddress, config.swapRouterAddress)];
                case 18:
                    usdtAllowance = _a.sent();
                    console.log("\u2139\uFE0F  ETH Allowance: Not required (native token)");
                    console.log("\u2705 USDT Allowance: ".concat(usdtAllowance, " USDT"));
                    console.log("\uD83C\uDFE6 Spender: ".concat(config.swapRouterAddress));
                    console.log('💡 Note: ETH doesn\'t require approval, only ERC20 tokens do');
                    console.log();
                    return [3 /*break*/, 20];
                case 19:
                    error_4 = _a.sent();
                    console.log("\u274C Allowance check failed: ".concat(error_4));
                    console.log();
                    return [3 /*break*/, 20];
                case 20:
                    // ===========================================
                    // Example 5: Prepare ETH to USDT Swap Data
                    // ===========================================
                    console.log('🔧 Example 5: Prepare ETH → USDT Swap Transaction');
                    console.log('-'.repeat(40));
                    _a.label = 21;
                case 21:
                    _a.trys.push([21, 23, , 24]);
                    swapParams = {
                        tokenIn: tokens.WETH, // Use WETH internally for ETH swaps
                        tokenOut: tokens.USDT,
                        amountIn: '0.05',
                        slippageTolerance: config_1.DEFAULT_SLIPPAGE,
                        deadline: config_1.DEFAULT_DEADLINE,
                        recipient: demoWalletAddress,
                    };
                    return [4 /*yield*/, swapService.prepareSwapData(swapParams)];
                case 22:
                    swapData = _a.sent();
                    console.log("\uD83D\uDCC4 Transaction prepared for: ".concat(swapParams.amountIn, " ETH \u2192 USDT"));
                    console.log("\uD83C\uDFAF Target Contract: ".concat(swapData.to));
                    console.log("\u26FD Gas Estimate: ".concat(swapData.gasEstimate));
                    console.log("\uD83D\uDCB0 ETH Value Required: ".concat(swapParams.amountIn, " ETH (for swap) + gas fees"));
                    console.log("\uD83D\uDCDD Calldata Length: ".concat(swapData.data.length, " bytes"));
                    console.log('ℹ️  This transaction will:');
                    console.log('   1. Take your ETH');
                    console.log('   2. Wrap it to WETH automatically');
                    console.log('   3. Swap WETH to USDT');
                    console.log('   4. Send USDT to your address');
                    console.log();
                    return [3 /*break*/, 24];
                case 23:
                    error_5 = _a.sent();
                    console.log("\u274C Swap preparation failed: ".concat(error_5));
                    console.log();
                    return [3 /*break*/, 24];
                case 24:
                    // ===========================================
                    // Example 6: Prepare USDT to ETH Swap Data
                    // ===========================================
                    console.log('🔧 Example 6: Prepare USDT → ETH Swap Transaction');
                    console.log('-'.repeat(40));
                    _a.label = 25;
                case 25:
                    _a.trys.push([25, 27, , 28]);
                    swapParams = {
                        tokenIn: tokens.USDT,
                        tokenOut: tokens.WETH, // Use WETH internally for ETH swaps
                        amountIn: '50',
                        slippageTolerance: config_1.DEFAULT_SLIPPAGE,
                        deadline: config_1.DEFAULT_DEADLINE,
                        recipient: demoWalletAddress,
                    };
                    return [4 /*yield*/, swapService.prepareSwapData(swapParams)];
                case 26:
                    swapData = _a.sent();
                    console.log("\uD83D\uDCC4 Transaction prepared for: ".concat(swapParams.amountIn, " USDT \u2192 ETH"));
                    console.log("\uD83C\uDFAF Target Contract: ".concat(swapData.to));
                    console.log("\u26FD Gas Estimate: ".concat(swapData.gasEstimate));
                    console.log("\uD83D\uDCB0 ETH Value: ".concat(swapData.value, " (only for gas)"));
                    console.log("\uD83D\uDCDD Calldata Length: ".concat(swapData.data.length, " bytes"));
                    console.log('ℹ️  This transaction will:');
                    console.log('   1. Take your USDT (requires approval first)');
                    console.log('   2. Swap USDT to WETH');
                    console.log('   3. Unwrap WETH to ETH automatically');
                    console.log('   4. Send ETH to your address');
                    console.log();
                    return [3 /*break*/, 28];
                case 27:
                    error_6 = _a.sent();
                    console.log("\u274C Swap preparation failed: ".concat(error_6));
                    console.log();
                    return [3 /*break*/, 28];
                case 28:
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
                    return [3 /*break*/, 30];
                case 29:
                    error_7 = _a.sent();
                    console.error('❌ Base demo failed:', error_7);
                    return [3 /*break*/, 30];
                case 30: return [2 /*return*/];
            }
        });
    });
}
// ===========================================
// Additional Utility Functions
// ===========================================
function showBaseTokenInfo() {
    return __awaiter(this, void 0, void 0, function () {
        var tokens, _i, _a, _b, symbol, token;
        return __generator(this, function (_c) {
            console.log('\n📋 Base Network Token Information');
            console.log('='.repeat(50));
            tokens = config_1.COMMON_TOKENS[8453];
            for (_i = 0, _a = Object.entries(tokens); _i < _a.length; _i++) {
                _b = _a[_i], symbol = _b[0], token = _b[1];
                console.log("".concat(symbol, ":"));
                console.log("  Name: ".concat(token.name || 'Unknown'));
                console.log("  Address: ".concat(token.address));
                console.log("  Decimals: ".concat(token.decimals));
                console.log("  Explorer: https://basescan.org/token/".concat(token.address));
                console.log();
            }
            return [2 /*return*/];
        });
    });
}
function showSwapInstructions() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
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
            return [2 /*return*/];
        });
    });
}
// ===========================================
// Main Execution
// ===========================================
function main() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🟡 Base Network Uniswap Token Swap Demo');
                    console.log('🔗 https://base.org | Chain ID: 8453');
                    console.log('='.repeat(60));
                    console.log();
                    // Run the main demo
                    return [4 /*yield*/, demonstrateBaseSwaps()];
                case 1:
                    // Run the main demo
                    _a.sent();
                    // Show additional information
                    return [4 /*yield*/, showBaseTokenInfo()];
                case 2:
                    // Show additional information
                    _a.sent();
                    return [4 /*yield*/, showSwapInstructions()];
                case 3:
                    _a.sent();
                    console.log('\n🎉 Demo completed! Ready to swap on Base network.');
                    console.log('💙 Happy swapping on Base! 🟡');
                    return [2 /*return*/];
            }
        });
    });
}
// Run the demo
if (require.main === module) {
    main().catch(console.error);
}
