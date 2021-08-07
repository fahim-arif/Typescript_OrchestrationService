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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const MailerService_1 = __importDefault(require("@services/mailer/MailerService"));
class MailerRouter {
    constructor() {
        this.router = express_1.default.Router();
        this.getSubscribers = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const subscribers = yield this.mailerService.getSubscribers();
                res.status(200).json(subscribers);
            }
            catch (error) {
                next(error);
            }
        });
        this.getSubscriberById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const subscriber = yield this.mailerService.getSubscriberById(id);
                res.status(200).json(subscriber);
            }
            catch (error) {
                next(error);
            }
        });
        this.createSubscriber = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const subscriberCreate = req.body;
                const subcriber = yield this.mailerService.createSubscriber(subscriberCreate);
                res.status(201).json(subcriber);
            }
            catch (error) {
                next(error);
            }
        });
        this.initializeRoutes();
        this.mailerService = new MailerService_1.default();
    }
    initializeRoutes() {
        this.router.get('/', this.getSubscribers);
        this.router.get('/:id', this.getSubscriberById);
        this.router.post('/', this.createSubscriber);
    }
}
exports.default = MailerRouter;
//# sourceMappingURL=MailerRouter.js.map