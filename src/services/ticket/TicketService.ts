import {TicketCreate, TicketGet} from '@models/Ticket';
import {logger} from '@middlewares/log/Logger';
import {InternalError, NotFound} from '@utils/HttpException';
import {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios';
import {api} from '@utils/Api';
import auth0Helper from '@middlewares/auth/Auth0Helper';

export default class MailerService {

  private axiosInstance: AxiosInstance;
  private accountSvcAudience: string;

  constructor() {
        /* global process */
    if (!process.env.ACCOUNT_SERVICE_HOST || !process.env.ACCOUNT_SERVICE_AUD) {
      logger.error('Missing required details to initialize Register API');
      throw new Error('Missing required fields to initialize Register API');
    }
    this.axiosInstance = api(process.env.ACCOUNT_SERVICE_HOST);
    this.accountSvcAudience = process.env.ACCOUNT_SERVICE_AUD;
  }


  async getTicketById(id: string) : Promise<TicketGet> {
    try {
      throw new NotFound(`Ticket with id ${id} not found`);
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      } else {
        throw new InternalError(error.message);
      }
    }
  }

  async createTicket(ticketCreate: TicketCreate) : Promise<TicketGet> {
    try {
      const token = await auth0Helper.getTokenForApi(this.accountSvcAudience);

      const options: AxiosRequestConfig = {
        method: 'POST',
        url: '/user-tickets',
        headers: {
          authorization: `Bearer ${token}`,
          'cache-control': 'no-cache',
        },
        data: {
          ...ticketCreate,
        },
      };

      const response: AxiosResponse<TicketGet> = await this.axiosInstance.request(options);
      const ticketGet: TicketGet = response.data;
      return ticketGet;
    } catch (error) {
      logger.error('User ticket Creation Failed.');
      throw new InternalError(error.message);
    }
  }
}
