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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const dotenv = __importStar(require("dotenv"));
const winston_1 = __importDefault(require("winston"));
dotenv.config();
// Security levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
// Set level per env
/* global process */
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = (env === 'development');
    return isDevelopment ? 'debug' : 'info';
};
// Colours for level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
winston_1.default.addColors(colors);
/**  TODO: Maybe need to update this format to Json for other streams*/
const format = winston_1.default.format.combine(winston_1.default.format.errors({ stack: true }), winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => {
    if (info.stack) {
        return `${info.timestamp} [${info.level}]:  ${info.message} - ${info.stack}`;
    }
    return `${info.timestamp} [${info.level}]:  ${info.message}`;
}));
// Need to add other transports later
const transports = [
    new winston_1.default.transports.Console(),
];
exports.logger = winston_1.default.createLogger({
    level: level(),
    levels,
    format,
    transports,
    defaultMeta: { service: 'gateway-api' },
});
//# sourceMappingURL=Logger.js.map