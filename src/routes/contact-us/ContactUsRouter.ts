import express, {NextFunction, Request, Response} from 'express';
import {validate} from 'express-validation';
import {checkRateLimit} from '@middlewares/RequestRateHandler';
import {ContactUsCreate} from '@models/ContactUs';
import {contactUsValidation} from '@models/validations/ContactUs';
import ContactUsService from '@services/contact-us/ContactUsService';

export default class ContactUsRouter {
  public router = express.Router();
  public path = '/contact-us';
  private contactUsService : ContactUsService;

  private sendContactUsEmail = async (req: Request, res : Response, next: NextFunction) => {
    try {
      const contactUsCreate: ContactUsCreate = req.body;
      await this.contactUsService.sendContactUsEmail(contactUsCreate);
      res.status(200).json();
    } catch (error) {
      next(error);
    }
  };

  constructor(contactUsService: ContactUsService) {
    this.initializeRoutes();
    this.contactUsService = contactUsService;
  }

  initializeRoutes() {
    this.router.use(checkRateLimit());
    this.router.post('/', validate(contactUsValidation, {keyByField: true}, {abortEarly: false}), this.sendContactUsEmail);
  }
}
