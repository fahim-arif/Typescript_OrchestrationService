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
const client_1 = require("@prisma/client");
const PrismaClient_1 = __importDefault(require("@repositories/prisma/PrismaClient"));
const HttpException_1 = require("@utils/HttpException");
class MailerRepository {
    //   private subscribers: SubscriberGet[] = [
    //     {
    //       id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    //       email: 'john.doe@example.com',
    //       first_name: 'John',
    //       last_name: 'Doe',
    //       contact_no: '91-0123456789',
    //       subscribe_date: new Date(),
    //       status: SubscriberStatus.SUBSCRIBED,
    //     },
    //   ];
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const subscribers = yield PrismaClient_1.default.subscriber.findMany();
            return subscribers;
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const subscriber = yield PrismaClient_1.default.subscriber.findUnique({
                where: {
                    id,
                },
            });
            if (subscriber) {
                return subscriber;
            }
            else {
                throw new HttpException_1.NotFound('Resource not found');
            }
        });
    }
    create(subcscriberCreate) {
        return __awaiter(this, void 0, void 0, function* () {
            const { first_name, last_name, email, contact_no } = subcscriberCreate;
            const subscriber = yield PrismaClient_1.default.subscriber.create({
                data: {
                    first_name,
                    last_name,
                    email,
                    contact_no,
                    status: client_1.SubscriberStatus.SUBSCRIBED,
                },
            });
            return subscriber;
        });
    }
}
exports.default = MailerRepository;
//# sourceMappingURL=MailerRepository.js.map