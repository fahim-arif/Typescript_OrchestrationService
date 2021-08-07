import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import MailerRouter from '@routes/mailer/MailerRouter';

const app = express();


app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello!');
});

const mailerRouter = new MailerRouter();
app.use('/subscribers', mailerRouter.router);

export default app;
