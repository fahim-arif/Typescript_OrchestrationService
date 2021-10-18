import * as dotenv from 'dotenv';
import 'module-alias/register';
import {logger} from '@middlewares/log/Logger';
import MailerRouter from '@routes/mailer/MailerRouter';
import MailerService from '@services/mailer/MailerService';
import MailerRepository from '@repositories/mailer/MailerRepository';
import RegisterRouter from './routes/register/RegisterRouter';
import RegisterService from '@services/register/RegisterService';


import App from './app';

dotenv.config();


/* global process */
if (!process.env.PORT) {
  logger.error('PORT not defined. Exiting');
  process.exit(1);
}

const PORT: number = parseInt(process.env.PORT as string, 10);

if (!process.env.NODE_ENV) {
  logger.warn('NODE_ENV not defined. Setting to development by default');
  process.env.NODE_ENV = 'development';

}

logger.info('Trying to start server with below configuration');
logger.info(`PORT : ${process.env.PORT}`);
logger.info(`NODE_ENV : ${process.env.NODE_ENV}`);

const app = new App(
  [
    new MailerRouter(new MailerService(new MailerRepository())),
    new RegisterRouter(new RegisterService()),
  ],
    PORT,
  );

app.listen();