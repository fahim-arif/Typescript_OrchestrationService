/* eslint-disable @typescript-eslint/no-explicit-any */
import * as dotenv from 'dotenv';
import 'module-alias/register';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import {notFoundHandler} from '@middlewares/error/NotFoundHandler';
import {httpErrorHandler} from '@middlewares/error/HttpErrorHandler';
import morganMiddleware from '@middlewares/log/Morgan';
import {mdcMiddleware} from '@middlewares/log/LocalStore';
import {logger} from '@middlewares/log/Logger';
import {preconditionOptions} from '@middlewares/error/Precondition';
import preconditions from 'express-preconditions-addl';

dotenv.config();

export default class App {
  public app: express.Application;
  public port: number;

  /* global process */
  private BASE_PATH: string = process.env.BASE_PATH || '';

  constructor(controllers: any, port:number) {
    this.app = express();
    this.port = port;

    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeErrorHandlers();
  }

  private initializeMiddlewares() {
    // Initialize Middlewares
    this.app.use(morganMiddleware);
    this.app.use(helmet());
    const corsOptions = {
      exposedHeaders: ['Etag'],
    };
    this.app.use(cors(corsOptions));
    this.app.use(express.json());
    this.app.use(mdcMiddleware);
    this.app.use(preconditions(preconditionOptions));
    // Enable Etag
    this.app.set('etag', 'strong');
  }

  private initializeControllers(controllers:any) {
    controllers.forEach((controller:any) => {
      this.app.use(`${this.BASE_PATH}${controller.path}`, controller.router);
    });
  }

  private initializeErrorHandlers() {
    this.app.use(httpErrorHandler);
    this.app.use(notFoundHandler);
  }

  public listen() {
    this.app.listen(this.port, () =>
        logger.info(`gateway-api started on port : ${this.port}`));
  }
}
