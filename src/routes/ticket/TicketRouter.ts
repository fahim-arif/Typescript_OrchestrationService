import express, {NextFunction, Request, Response} from 'express';
import {checkRateLimit} from '@middlewares/RequestRateHandler';
import {ticketCreateValidation} from '@models/validations/Ticket';
import {validate} from 'express-validation';
import {ResetPasswordType, TicketCreate, TicketWithUserGet} from '@models/Ticket';
import TicketService from '@services/ticket/TicketService';
import {resetPasswordValidation} from '@models/validations/ResetPassword';


export default class TicketRouter {
  public router = express.Router();
  public path = '/tickets';
  private ticketService : TicketService;


  private getTicketById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id : string = req.params.id;
      const ticket = await this.ticketService.getTicketById(id);
      res.status(200).json(ticket);
    } catch (error) {
      next(error);
    }
  };

  private createTicket = async (req: Request, res : Response, next: NextFunction) => {
    try {
      const ticketCreate: TicketCreate = req.body;
      await this.ticketService.createTicket(ticketCreate);
      res.status(201).json();
    } catch (error) {
      next(error);
    }
  };

  private verifyTicket = async (req: Request, res : Response, next: NextFunction) => {
    try {
      const id: string = req.params.ticket;
      const userWithTicket: TicketWithUserGet = await this.ticketService.verifyUserTicket(id);
      res.status(200).json(userWithTicket);
    } catch (error) {
      next(error);
    }
  };

  private resetPassword = async (req: Request, res : Response, next: NextFunction) => {
    try {
      const resetPasswordData: ResetPasswordType = req.body;
      await this.ticketService.resetPassword(resetPasswordData);
      res.status(200).json();
    } catch (error) {
      next(error);
    }
  };

  constructor(ticketService: TicketService) {
    this.initializeRoutes();
    this.ticketService = ticketService;
  }

  initializeRoutes() {
    this.router.use(checkRateLimit());
    this.router.get('/:id', this.getTicketById);
    this.router.post('/', checkRateLimit({windowSizeMs: 30 * 60 * 1000, maxNumberOfRequests: 5}), validate(ticketCreateValidation, {}, {}), this.createTicket);
    this.router.post('/reset-password', checkRateLimit({windowSizeMs: 30 * 60 * 1000, maxNumberOfRequests: 5}), validate(resetPasswordValidation, {keyByField: true}, {abortEarly: false}), this.resetPassword);
    this.router.get('/verify/:ticket', checkRateLimit({windowSizeMs: 30 * 60 * 1000, maxNumberOfRequests: 5}), this.verifyTicket);
  }

}
