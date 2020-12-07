#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = void 0;
var koa_1 = __importDefault(require("koa"));
var buildInfo = __importStar(require("./package.json"));
var cors_1 = __importDefault(require("@koa/cors"));
var koa_logger_1 = __importDefault(require("koa-logger"));
var log4js_1 = require("log4js");
var koa_router_1 = __importDefault(require("koa-router"));
var koa_send_1 = __importDefault(require("koa-send"));
var minimist_1 = __importDefault(require("minimist"));
var argv = minimist_1.default(process.argv.slice(2));
var root = argv.r || argv.root || '.';
var port = argv.p || argv.port || 80;
var index = argv.i || argv.index || 'index.html';
var page404 = argv.p4 || argv.page404 || 'index.html';
var logger = log4js_1.getLogger('http');
logger.level = 'info';
function startServer() {
    return __awaiter(this, void 0, void 0, function () {
        var app, liveCheckRouter;
        var _this = this;
        return __generator(this, function (_a) {
            logger.info('Name:', buildInfo.name);
            logger.info('Version:', buildInfo.version);
            logger.info('Start http server...');
            app = new koa_1.default();
            app.use(function (ctx, next) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (ctx.request.method !== 'HEAD') {
                                logger.info("  <-- IP " + ctx.get('X-Forwarded-For'));
                            }
                            return [4 /*yield*/, next()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            app.use(koa_logger_1.default(function (str, args) {
                if (args[1] !== 'HEAD') {
                    logger.info(str);
                }
            }));
            app.use(cors_1.default());
            liveCheckRouter = new koa_router_1.default();
            liveCheckRouter.head('/ping', function (ctx) { return ctx.body = 'ok'; });
            liveCheckRouter.post('/ping', function (ctx) { return ctx.body = 'ok'; });
            app.use(liveCheckRouter.routes());
            app.use(liveCheckRouter.allowedMethods());
            app.use(function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var opts, e_1, e_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            opts = {
                                index: index,
                                root: root,
                            };
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 8]);
                            return [4 /*yield*/, koa_send_1.default(ctx, ctx.path, opts)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 8];
                        case 3:
                            e_1 = _a.sent();
                            _a.label = 4;
                        case 4:
                            _a.trys.push([4, 6, , 7]);
                            return [4 /*yield*/, koa_send_1.default(ctx, page404, opts)];
                        case 5:
                            _a.sent();
                            return [3 /*break*/, 7];
                        case 6:
                            e_2 = _a.sent();
                            ctx.status = 404;
                            ctx.body = 'Not Found.';
                            return [3 /*break*/, 7];
                        case 7: return [3 /*break*/, 8];
                        case 8: return [2 /*return*/];
                    }
                });
            }); });
            app.listen(port);
            logger.info('Server listening port: ' + port);
            return [2 /*return*/];
        });
    });
}
exports.startServer = startServer;
startServer().catch(console.error);
