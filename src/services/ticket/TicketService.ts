import {TicketCreate, TicketGet, ResetPasswordType, TicketWithUserGet, UserTicketGet} from '@models/Ticket';
import {logger} from '@middlewares/log/Logger';
import {InternalError, NotFound, BadRequest} from '@utils/HttpException';
import {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios';
import {api} from '@utils/Api';
import auth0Helper from '@middlewares/auth/Auth0Helper';
import {Auth0User, UserGet} from '@models/User';
import {EmailCreate} from '@models/Email';
import sgMail from '@sendgrid/mail';

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
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
  }


  async getTicketById(id: string) : Promise<TicketGet> {
    try {
      const token = await auth0Helper.getTokenForApi(this.accountSvcAudience);

      const options: AxiosRequestConfig = {
        method: 'GET',
        url: `/user-tickets/${id}`,
        headers: {
          authorization: `Bearer ${token}`,
          'cache-control': 'no-cache',
        },
      };

      const response: AxiosResponse<TicketGet> = await this.axiosInstance.request(options);
      const ticketGet: TicketGet = response.data;
      return ticketGet;
    } catch (error) {
      logger.error(`Ticket with id ${id} not found.`);
      if (error.response && error.response.status === 404) {
        throw new NotFound(`Ticket with id ${id} not found`);
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

      if (ticketCreate.ticketType === 'CHANGE_PASSWORD') {
        // send reset password link email
        const message = this.createForgotPasswordEmail(ticketGet.id, ticketCreate.email);
        await sgMail.send(message);
      }

      return ticketGet;
    } catch (error) {
      logger.error('User ticket Creation Failed.');
      if (error.response && error.response.status === 404) {
        throw new NotFound('No user with this email exists');
      } else {
        throw new InternalError(error.message);
      }
    }
  }

  createForgotPasswordEmail(id: string, email: string): EmailCreate {
    const resetLink = `${process.env.CLIENT_HOST}/reset-password?ticket=${id}`;
    const message = {
      to: email,
      from: process.env.SENDGRID_EMAIL_FROM || 'support@twomatches.xyz',
      subject: 'Reset your password for localhost',
      html: `Please click the link below to reset your password<br /><br /><a href="${resetLink}">Reset Password</a><br /><br />Or copy and paste below link:<br />${resetLink}`,
    };

    return message;
  }

  async verifyUserTicket(id: string): Promise<TicketWithUserGet> {
    try {
      const token = await auth0Helper.getTokenForApi(this.accountSvcAudience);

      let options: AxiosRequestConfig = {
        method: 'GET',
        url: `/user-tickets/${id}`,
        headers: {
          authorization: `Bearer ${token}`,
          'cache-control': 'no-cache',
        },
      };

      const response: AxiosResponse<UserTicketGet> = await this.axiosInstance.request(options);
      const userTicketGet: UserTicketGet = response.data;

      if (!this.isValidTicket(userTicketGet)) {
        throw new BadRequest(`Ticket with id ${id} not valid`);
      }

      options = {
        method: 'GET',
        url: `/users/${userTicketGet.user_id}`,
        headers: {
          authorization: `Bearer ${token}`,
          'cache-control': 'no-cache',
        },
      };

      const userResponse: AxiosResponse<UserGet> = await this.axiosInstance.request(options);
      const user: UserGet = userResponse.data;

      const ticketWithUser: TicketWithUserGet = {
        id: userTicketGet.id,
        user: {
          name: user.name,
          email: user.email,
        },
      };

      return ticketWithUser;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new NotFound('No such ticket exists');
      } else if (error instanceof BadRequest) {
        throw error;
      } else {
        throw new InternalError(error.message);
      }
    }
  }

  async resetPassword(resetPasswordData: ResetPasswordType): Promise<TicketGet> {
    try {

      const token = await auth0Helper.getTokenForApi(this.accountSvcAudience);

      const {id, password} = resetPasswordData;

      let options: AxiosRequestConfig = {
        method: 'GET',
        url: `/user-tickets/${id}`,
        headers: {
          authorization: `Bearer ${token}`,
          'cache-control': 'no-cache',
        },
      };

      const response: AxiosResponse<UserTicketGet> = await this.axiosInstance.request(options);
      const userTicketGet: UserTicketGet = response.data;

      if (!this.isValidTicket(userTicketGet)) {
        throw new BadRequest(`Ticket with id ${id} not valid`);
      }

      // update password by PATCH to account-svc PATCH /users/
      options = {
        method: 'PATCH',
        url: `/users/${userTicketGet.user_id}`,
        headers: {
          authorization: `Bearer ${token}`,
          'cache-control': 'no-cache',
          'If-Match': '*',
        },
        data: {
          password,
        },
      };

      const userResponse: AxiosResponse<Auth0User> = await this.axiosInstance.request(options);
      const user: Auth0User = userResponse.data;

      // update ticket to CLOSED
      options = {
        method: 'PATCH',
        url: `/user-tickets/${id}`,
        headers: {
          authorization: `Bearer ${token}`,
          'cache-control': 'no-cache',
          'If-Match': response.headers.etag,
        },
        data: {
          status: 'CLOSED',
        },
      };

      const ticketResponse: AxiosResponse<TicketGet> = await this.axiosInstance.request(options);
      const ticketUpdated: TicketGet = ticketResponse.data;

      const message = {
        to: user.email,
        from: process.env.SENDGRID_EMAIL_FROM || 'support@twomatches.xyz',
        subject: 'Password updated for localhost successfully',
        html: 'Your password has been changed successfully',
      };

      // send reset password confirmation email
      await sgMail.send(message);

      return ticketUpdated;

    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new NotFound('No such ticket exists');
      } else if (error.response && error.response.status === 400) {
        throw new BadRequest(error.response.data.detail);
      } else {
        throw new InternalError(error.message);
      }
    }
  }


  isValidTicket(userTicket: UserTicketGet): boolean {
    if (userTicket.status === 'CLOSED') {
      return false;
    }

    const differenceInSeconds = ((new Date()).valueOf() - (new Date(userTicket.created_at)).valueOf()) / 1000;
    if (differenceInSeconds > userTicket.time_to_live) {
      return false;
    }

    return true;
  }
}
