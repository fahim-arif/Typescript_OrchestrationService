import {InternalError, NotFound} from '@utils/HttpException';
import {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios';
import {api} from '@utils/Api';
import {logger} from '@middlewares/log/Logger';
import auth0Helper from '@middlewares/auth/Auth0Helper';
import {ResetPasswordType, TicketWithUserGet, UserTicketCreate, UserTicketGet} from '@root/models/UserTicket';
import {Auth0User, UserGet} from '@root/models/User';
import sgMail from '@sendgrid/mail';


export default class UserTicketService {

  private axiosInstance: AxiosInstance;
  private accountSvcAudience: string;

  constructor() {
    /* global process */
    if (!process.env.ACCOUNT_SERVICE_HOST || !process.env.ACCOUNT_SERVICE_AUD) {
      logger.error('Missing required details to initialize Account Service API');
      throw new Error('Missing required fields to initialize Account Service API');
    }
    this.axiosInstance = api(process.env.ACCOUNT_SERVICE_HOST);
    this.accountSvcAudience = process.env.ACCOUNT_SERVICE_AUD;
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
  }

  async createUserTicket(userTicketCreate: UserTicketCreate): Promise<AxiosResponse> {
    try {
      const token = await auth0Helper.getTokenForApi(this.accountSvcAudience);

      const options: AxiosRequestConfig = {
        method: 'POST',
        url: '/user-tickets',
        headers: {
          authorization: `Bearer ${token}`,
          'cache-control': 'no-cache',
        },
        data: userTicketCreate,
      };

      const response: AxiosResponse<UserTicketGet> = await this.axiosInstance.request(options);
      const userTicket: UserTicketGet = response.data;

      // send reset password link email using SendGrid
      const message = this.createForgotPasswordEmail(userTicket, userTicketCreate.email);
      await sgMail.send(message);

      return response;
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      } else {
        throw new InternalError(error.message);
      }
    }
  }

  createForgotPasswordEmail(userTicket: UserTicketGet, email: string) {
    const resetLink = `http://localhost:3000/reset-password?ticket=${userTicket.id}`;
    const message = {
      to: email,
      from: process.env.SENDGRID_EMAIL_FROM || 'rajasha1711@gmail.com',
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
      const userTicket: UserTicketGet = response.data;

      if (!this.isValidTicket(userTicket)) {
        throw new Error(`Ticket with id ${id} not valid`);
      }

      options = {
        method: 'GET',
        url: `/users/${userTicket.user_id}`,
        headers: {
          authorization: `Bearer ${token}`,
          'cache-control': 'no-cache',
        },
      };

      const userResponse: AxiosResponse<UserGet> = await this.axiosInstance.request(options);
      const user: UserGet = userResponse.data;

      const ticketWithUser: TicketWithUserGet = {
        id: userTicket.id,
        user: {
          name: user.name,
          email: user.email,
        },
      };

      return ticketWithUser;
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      } else {
        throw new InternalError(error.message);
      }
    }
  }


  async resetPassword(resetPasswordData: ResetPasswordType): Promise<AxiosResponse> {
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

      const userTicket: UserTicketGet = response.data;

      if (!this.isValidTicket(userTicket)) {
        throw new Error(`Ticket with id ${id} not valid`);
      }

      // update password by PATCH to account-svc PATCH /users/
      options = {
        method: 'PATCH',
        url: `/users/${userTicket.user_id}`,
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

      const ticketResponse = await this.axiosInstance.request(options);

      const message = {
        to: user.email,
        from: process.env.SENDGRID_EMAIL_FROM || 'rajasha1711@gmail.com',
        subject: 'Password updated for localhost successfully',
        html: 'Your password has been changed successfully',
      };

      // send reset password confirmation email
      await sgMail.send(message);

      return ticketResponse;

    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
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
