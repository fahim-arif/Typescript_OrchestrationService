"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const MailerRouter_1 = __importDefault(require("@routes/mailer/MailerRouter"));
const app = express_1.default();
app.use(helmet_1.default());
app.use(cors_1.default());
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('Hello!');
});
const mailerRouter = new MailerRouter_1.default();
app.use('/subscribers', mailerRouter.router);
exports.default = app;
//# sourceMappingURL=app.js.map