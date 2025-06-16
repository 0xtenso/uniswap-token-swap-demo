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
exports.SwapService = void 0;
var ethers_1 = require("ethers");
var sdk_core_1 = require("@uniswap/sdk-core");
var v3_sdk_1 = require("@uniswap/v3-sdk");
var config_1 = require("./config");
// Minimal ABI for ERC20 and Uniswap contracts
var ERC20_ABI = [
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    'function balanceOf(address) view returns (uint256)',
    'function allowance(address, address) view returns (uint256)',
    'function approve(address, uint256) returns (bool)',
];
var QUOTER_ABI = [
    'function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)',
];
var POOL_ABI = [
    'function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
    'function liquidity() external view returns (uint128)',
    'function fee() external view returns (uint24)',
];
var SWAP_ROUTER_ABI = [
    'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)',
];
var SwapService = /** @class */ (function () {
    function SwapService(chainId, privateKey) {
        this.chainConfig = config_1.CHAIN_CONFIGS[chainId];
        if (!this.chainConfig) {
            throw new Error("Unsupported chain ID: ".concat(chainId));
        }
        this.provider = new ethers_1.ethers.JsonRpcProvider(this.chainConfig.rpcUrl);
        if (privateKey) {
            this.signer = new ethers_1.ethers.Wallet(privateKey, this.provider);
        }
    }
    SwapService.prototype.getTokenBalance = function (tokenAddress, walletAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenContract, balance, decimals;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tokenContract = new ethers_1.ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
                        return [4 /*yield*/, tokenContract.balanceOf(walletAddress)];
                    case 1:
                        balance = _a.sent();
                        return [4 /*yield*/, tokenContract.decimals()];
                    case 2:
                        decimals = _a.sent();
                        return [2 /*return*/, ethers_1.ethers.formatUnits(balance, decimals)];
                }
            });
        });
    };
    SwapService.prototype.approveToken = function (tokenAddress, spenderAddress, amount) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenContract, decimals, amountWei, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.signer) {
                            throw new Error('Signer not initialized. Provide private key to constructor.');
                        }
                        tokenContract = new ethers_1.ethers.Contract(tokenAddress, ERC20_ABI, this.signer);
                        return [4 /*yield*/, tokenContract.decimals()];
                    case 1:
                        decimals = _a.sent();
                        amountWei = ethers_1.ethers.parseUnits(amount, decimals);
                        return [4 /*yield*/, tokenContract.approve(spenderAddress, amountWei)];
                    case 2:
                        tx = _a.sent();
                        return [4 /*yield*/, tx.wait()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, tx.hash];
                }
            });
        });
    };
    SwapService.prototype.getQuote = function (tokenIn_1, tokenOut_1, amountIn_1) {
        return __awaiter(this, arguments, void 0, function (tokenIn, tokenOut, amountIn, fee) {
            var quoterContract, amountInWei, quotedAmountOut, amountOut, priceImpact, error_1;
            if (fee === void 0) { fee = v3_sdk_1.FeeAmount.MEDIUM; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        quoterContract = new ethers_1.ethers.Contract(this.chainConfig.quoterAddress, QUOTER_ABI, this.provider);
                        amountInWei = ethers_1.ethers.parseUnits(amountIn, tokenIn.decimals);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, quoterContract.quoteExactInputSingle.staticCall(tokenIn.address, tokenOut.address, fee, amountInWei, 0 // sqrtPriceLimitX96 (0 = no limit)
                            )];
                    case 2:
                        quotedAmountOut = _a.sent();
                        amountOut = ethers_1.ethers.formatUnits(quotedAmountOut, tokenOut.decimals);
                        priceImpact = '0.1';
                        return [2 /*return*/, {
                                amountOut: amountOut,
                                gasEstimate: '150000', // Estimated gas
                                priceImpact: priceImpact,
                                route: [tokenIn.symbol, tokenOut.symbol],
                            }];
                    case 3:
                        error_1 = _a.sent();
                        throw new Error("Failed to get quote: ".concat(error_1));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SwapService.prototype.executeSwap = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var quote, amountOutMin, swapParams, swapRouter, tx, receipt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.signer) {
                            throw new Error('Signer not initialized. Provide private key to constructor.');
                        }
                        return [4 /*yield*/, this.getQuote(params.tokenIn, params.tokenOut, params.amountIn)];
                    case 1:
                        quote = _a.sent();
                        amountOutMin = ethers_1.ethers.parseUnits((parseFloat(quote.amountOut) * (1 - params.slippageTolerance / 100)).toString(), params.tokenOut.decimals);
                        swapParams = {
                            tokenIn: params.tokenIn.address,
                            tokenOut: params.tokenOut.address,
                            fee: v3_sdk_1.FeeAmount.MEDIUM,
                            recipient: params.recipient,
                            deadline: Math.floor(Date.now() / 1000) + params.deadline,
                            amountIn: ethers_1.ethers.parseUnits(params.amountIn, params.tokenIn.decimals),
                            amountOutMinimum: amountOutMin,
                            sqrtPriceLimitX96: 0, // No price limit
                        };
                        swapRouter = new ethers_1.ethers.Contract(this.chainConfig.swapRouterAddress, SWAP_ROUTER_ABI, this.signer);
                        return [4 /*yield*/, swapRouter.exactInputSingle(swapParams, {
                                gasLimit: '300000',
                            })];
                    case 2:
                        tx = _a.sent();
                        return [4 /*yield*/, tx.wait()];
                    case 3:
                        receipt = _a.sent();
                        return [2 /*return*/, {
                                hash: tx.hash,
                                amountIn: params.amountIn,
                                amountOut: quote.amountOut,
                                gasUsed: receipt.gasUsed.toString(),
                            }];
                }
            });
        });
    };
    SwapService.prototype.checkAllowance = function (tokenAddress, ownerAddress, spenderAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenContract, allowance, decimals;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tokenContract = new ethers_1.ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
                        return [4 /*yield*/, tokenContract.allowance(ownerAddress, spenderAddress)];
                    case 1:
                        allowance = _a.sent();
                        return [4 /*yield*/, tokenContract.decimals()];
                    case 2:
                        decimals = _a.sent();
                        return [2 /*return*/, ethers_1.ethers.formatUnits(allowance, decimals)];
                }
            });
        });
    };
    SwapService.prototype.getChainConfig = function () {
        return this.chainConfig;
    };
    // Helper method to prepare swap data without executing
    SwapService.prototype.prepareSwapData = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var quote, amountOutMin, swapInterface, swapData, calldata, isEthIn, value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getQuote(params.tokenIn, params.tokenOut, params.amountIn)];
                    case 1:
                        quote = _a.sent();
                        amountOutMin = ethers_1.ethers.parseUnits((parseFloat(quote.amountOut) * (1 - params.slippageTolerance / 100)).toString(), params.tokenOut.decimals);
                        swapInterface = new ethers_1.ethers.Interface(SWAP_ROUTER_ABI);
                        swapData = {
                            tokenIn: params.tokenIn.address,
                            tokenOut: params.tokenOut.address,
                            fee: v3_sdk_1.FeeAmount.MEDIUM,
                            recipient: params.recipient,
                            deadline: Math.floor(Date.now() / 1000) + params.deadline,
                            amountIn: ethers_1.ethers.parseUnits(params.amountIn, params.tokenIn.decimals),
                            amountOutMinimum: amountOutMin,
                            sqrtPriceLimitX96: 0,
                        };
                        calldata = swapInterface.encodeFunctionData('exactInputSingle', [swapData]);
                        isEthIn = params.tokenIn.address.toLowerCase() === '0x4200000000000000000000000000000000000006'.toLowerCase();
                        value = isEthIn ? ethers_1.ethers.parseUnits(params.amountIn, 18).toString() : '0';
                        return [2 /*return*/, {
                                to: this.chainConfig.swapRouterAddress,
                                data: calldata,
                                value: value,
                                gasEstimate: quote.gasEstimate,
                            }];
                }
            });
        });
    };
    // Helper method for ETH to Token swaps
    SwapService.prototype.getEthToTokenQuote = function (tokenOut, ethAmount) {
        return __awaiter(this, void 0, void 0, function () {
            var wethToken;
            return __generator(this, function (_a) {
                wethToken = new sdk_core_1.Token(this.chainConfig.chainId, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether');
                return [2 /*return*/, this.getQuote(wethToken, tokenOut, ethAmount)];
            });
        });
    };
    // Helper method for Token to ETH swaps
    SwapService.prototype.getTokenToEthQuote = function (tokenIn, tokenAmount) {
        return __awaiter(this, void 0, void 0, function () {
            var wethToken;
            return __generator(this, function (_a) {
                wethToken = new sdk_core_1.Token(this.chainConfig.chainId, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether');
                return [2 /*return*/, this.getQuote(tokenIn, wethToken, tokenAmount)];
            });
        });
    };
    // Helper method for ETH to Token swaps execution
    SwapService.prototype.executeEthToTokenSwap = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var wethToken, swapParams, quote, amountOutMin, swapData, swapRouter, tx, receipt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.signer) {
                            throw new Error('Signer not initialized. Provide private key to constructor.');
                        }
                        wethToken = new sdk_core_1.Token(this.chainConfig.chainId, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether');
                        swapParams = {
                            tokenIn: wethToken,
                            tokenOut: params.tokenOut,
                            amountIn: params.amountIn,
                            slippageTolerance: params.slippageTolerance,
                            deadline: params.deadline,
                            recipient: params.recipient,
                        };
                        return [4 /*yield*/, this.getQuote(swapParams.tokenIn, swapParams.tokenOut, swapParams.amountIn)];
                    case 1:
                        quote = _a.sent();
                        amountOutMin = ethers_1.ethers.parseUnits((parseFloat(quote.amountOut) * (1 - swapParams.slippageTolerance / 100)).toString(), swapParams.tokenOut.decimals);
                        swapData = {
                            tokenIn: swapParams.tokenIn.address,
                            tokenOut: swapParams.tokenOut.address,
                            fee: v3_sdk_1.FeeAmount.MEDIUM,
                            recipient: swapParams.recipient,
                            deadline: Math.floor(Date.now() / 1000) + swapParams.deadline,
                            amountIn: ethers_1.ethers.parseUnits(swapParams.amountIn, swapParams.tokenIn.decimals),
                            amountOutMinimum: amountOutMin,
                            sqrtPriceLimitX96: 0,
                        };
                        swapRouter = new ethers_1.ethers.Contract(this.chainConfig.swapRouterAddress, SWAP_ROUTER_ABI, this.signer);
                        return [4 /*yield*/, swapRouter.exactInputSingle(swapData, {
                                gasLimit: '300000',
                                value: ethers_1.ethers.parseUnits(swapParams.amountIn, 18), // Send ETH with transaction
                            })];
                    case 2:
                        tx = _a.sent();
                        return [4 /*yield*/, tx.wait()];
                    case 3:
                        receipt = _a.sent();
                        return [2 /*return*/, {
                                hash: tx.hash,
                                amountIn: swapParams.amountIn,
                                amountOut: quote.amountOut,
                                gasUsed: receipt.gasUsed.toString(),
                            }];
                }
            });
        });
    };
    // Helper method for Token to ETH swaps execution
    SwapService.prototype.executeTokenToEthSwap = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var wethToken, swapParams;
            return __generator(this, function (_a) {
                if (!this.signer) {
                    throw new Error('Signer not initialized. Provide private key to constructor.');
                }
                wethToken = new sdk_core_1.Token(this.chainConfig.chainId, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether');
                swapParams = {
                    tokenIn: params.tokenIn,
                    tokenOut: wethToken,
                    amountIn: params.amountIn,
                    slippageTolerance: params.slippageTolerance,
                    deadline: params.deadline,
                    recipient: params.recipient,
                };
                return [2 /*return*/, this.executeSwap(swapParams)];
            });
        });
    };
    return SwapService;
}());
exports.SwapService = SwapService;
