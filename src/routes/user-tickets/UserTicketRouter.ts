import express, {NextFunction, Request, Response} from 'express';
import {validate} from 'express-validation';
import {userTicketCreateValidation} from '@models/validations/UserTicket';
import {ResetPasswordType, TicketWithUserGet, UserTicketCreate} from '@models/UserTicket';
import UserTicketService from '@services/user-tickets/UserTicketService';
import {resetPasswordValidation} from '@models/validations/ResetPassword';

export default class UserTicketRouter {
  public router = express.Router();
  public path = '/user-tickets';
  private userTicketService : UserTicketService;

  private createUserTicket = async (req: Request, res : Response, next: NextFunction) => {
    try {
      const userTicketCreate: UserTicketCreate = req.body;
      await this.userTicketService.createUserTicket(userTicketCreate);
      res.status(200).json();
    } catch (error) {
      next(error);
    }
  };

  private verifyUserTicket = async (req: Request, res : Response, next: NextFunction) => {
    try {
      const id: string = req.params.ticket;
      const userWithTicket: TicketWithUserGet = await this.userTicketService.verifyUserTicket(id);
      res.status(200).json(userWithTicket);
    } catch (error) {
      next(error);
    }
  };

  private resetPassword = async (req: Request, res : Response, next: NextFunction) => {
    try {
      const resetPasswordData: ResetPasswordType = req.body;
      await this.userTicketService.resetPassword(resetPasswordData);
      res.status(200).json();
    } catch (error) {
      next(error);
    }
  };

  constructor(userTicketService : UserTicketService) {
    this.initializeRoutes();
    this.userTicketService = userTicketService;
  }

  initializeRoutes() {
    this.router.post('/', validate(userTicketCreateValidation, {keyByField: true}, {abortEarly: false}), this.createUserTicket);
    this.router.post('/reset-password', validate(resetPasswordValidation, {keyByField: true}, {abortEarly: false}), this.resetPassword);
    this.router.get('/verify/:ticket', this.verifyUserTicket);
  }
}
