import express, {NextFunction, Request, Response} from 'express';
import {validate} from 'express-validation';
import RegisterService from '@services/register/RegisterService';
import {RegisterCreate} from '@models/Register';
import {registerValidation} from '@models/validations/Register';

export default class RegisterRouter {
  public router = express.Router();
  public path = '/register';
  private registerService : RegisterService;

  private register = async (req: Request, res : Response, next: NextFunction) => {
    try {
      const registerCreate: RegisterCreate = req.body;
      await this.registerService.register(registerCreate);
      res.status(201).json();
    } catch (error) {
      next(error);
    }
  };

  constructor(registerService : RegisterService) {
    this.initializeRoutes();
    this.registerService = registerService;
  }

  initializeRoutes() {
    this.router.post('/', validate(registerValidation, {keyByField: true}, {abortEarly: false}), this.register);
  }
}
