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
const MailerRepository_1 = __importDefault(require("@repositories/mailer/MailerRepository"));
class MailerService {
    constructor() {
        this.mailerRepository = new MailerRepository_1.default();
    }
    getSubscribers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const subscribers = this.mailerRepository.findAll();
                return subscribers;
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    getSubscriberById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const subscriber = this.mailerRepository.findById(id);
                return subscriber;
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    createSubscriber(subscriberCreate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const subscriber = this.mailerRepository.create(subscriberCreate);
                return subscriber;
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
}
exports.default = MailerService;
//# sourceMappingURL=MailerService.js.map