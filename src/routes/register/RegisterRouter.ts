import express, {NextFunction, Request, Response} from 'express';
import {validate} from 'express-validation';
import RegisterService from '@services/register/RegisterService';
import TicketService from '@services/ticket/TicketService';
import {RegisterCreate} from '@models/Register';
import {registerValidation} from '@models/validations/Register';
import {checkRateLimit} from '@middlewares/RequestRateHandler';
import {TicketCreate} from '@models/Ticket';

export default class RegisterRouter {
  public router = express.Router();
  public path = '/register';
  private registerService : RegisterService;
  private ticketService : TicketService;

  private register = async (req: Request, res : Response, next: NextFunction) => {
    try {
      const registerCreate: RegisterCreate = req.body;
      await this.registerService.register(registerCreate);

      const ticketCreate: TicketCreate = {
        email: registerCreate.email,
        ticketType: 'EMAIL_VERIFICATION',
      };

      await this.ticketService.createTicket(ticketCreate);

      res.status(201).json();
    } catch (error) {
      next(error);
    }
  };

  constructor(registerService : RegisterService, ticketService: TicketService) {
    this.initializeRoutes();
    this.registerService = registerService;
    this.ticketService = ticketService;
  }

  initializeRoutes() {
    this.router.post('/', checkRateLimit({windowSizeMs: 30 * 60 * 1000, maxNumberOfRequests: 5}), validate(registerValidation, {keyByField: true}, {abortEarly: false}), this.register);
  }
}
