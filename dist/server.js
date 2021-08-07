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
const dotenv = __importStar(require("dotenv"));
require("module-alias/register");
const Logger_1 = require("@middlewares/log/Logger");
const app_1 = __importDefault(require("./app"));
dotenv.config();
/* global process */
if (!process.env.PORT) {
    Logger_1.logger.error('PORT not defined. Exiting');
    process.exit(1);
}
const PORT = parseInt(process.env.PORT, 10);
if (!process.env.NODE_ENV) {
    Logger_1.logger.warn('NODE_ENV not defined. Setting to development by default');
    process.env.NODE_ENV = 'development';
}
Logger_1.logger.info('Trying to start server with below configuration');
Logger_1.logger.info(`PORT : ${process.env.PORT}`);
Logger_1.logger.info(`NODE_ENV : ${process.env.NODE_ENV}`);
app_1.default.listen(PORT, () => Logger_1.logger.info(`gateway-api started on port : ${PORT}`));
//# sourceMappingURL=server.js.map