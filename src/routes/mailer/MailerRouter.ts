import express, {NextFunction, Request, Response} from 'express';
import MailerService from '@services/mailer/MailerService';
import {SubscriberCreate, SubscriberGet} from '@models/Mailer';
import { validate } from 'express-validation';
import { mailerValidation } from '@models/validations/Mailer';

export default class MailerRouter {
  public router = express.Router();
  public path = '/subscribers';
  private mailerService : MailerService;

  private getSubscribers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subscribers: SubscriberGet[] = await this.mailerService.getSubscribers();
      res.status(200).json(subscribers);
    } catch (error) {
      next(error);
    }
  };

  private getSubscriberById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id : string = req.params.id;
      const subscriber = await this.mailerService.getSubscriberById(id);
      res.status(200).json(subscriber);
    } catch (error) {
      next(error);
    }
  };

  private createSubscriber = async (req: Request, res : Response, next: NextFunction) => {
    try {
      const subscriberCreate: SubscriberCreate = req.body;
      const subcriber = await this.mailerService.createSubscriber(subscriberCreate);
      res.status(201).json(subcriber);
    } catch (error) {
      next(error);
    }
  };

  constructor(mailerService: MailerService) {
    this.initializeRoutes();
    this.mailerService = mailerService;
  }

  initializeRoutes() {
    this.router.get('/', this.getSubscribers);
    this.router.get('/:id', this.getSubscriberById);
    this.router.post('/', validate(mailerValidation, {}, {}), this.createSubscriber);
  }

}
