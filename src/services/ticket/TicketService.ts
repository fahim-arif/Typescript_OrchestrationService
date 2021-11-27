import {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios';
import sgMail from '@sendgrid/mail';
import {logger} from '@middlewares/log/Logger';
import {api} from '@utils/Api';
import {InternalError, NotFound, BadRequest, getErrorFromStatus} from '@utils/HttpException';
import auth0Helper from '@middlewares/auth/Auth0Helper';
import {TicketCreate, TicketGet, ResetPasswordType, TicketWithUserGet, Auth0Ticket} from '@models/Ticket';
import {UserGet} from '@models/User';
import {EmailCreate} from '@models/Email';
import Mustache from 'mustache';

import config from '../../config.json';

export default class TicketService {

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


  async getTicketById(id: string) : Promise<TicketWithUserGet> {
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

      const ticketWithUser: TicketWithUserGet = await this.verifyTicket(ticketGet);

      return ticketWithUser;
    } catch (error) {
      logger.error(`Ticket Retrieval Failed for ticket id ${id}.`);
      if (error.response) {
        throw getErrorFromStatus(error.response.status, error.response.data.detail);
      } else if (error instanceof NotFound || error instanceof BadRequest) {
        throw error;
      } else {
        throw new InternalError(error.message);
      }
    }
  }

  async createTicket(ticketCreate: TicketCreate) : Promise<TicketGet | Auth0Ticket> {
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

      const response: AxiosResponse<TicketGet | Auth0Ticket> = await this.axiosInstance.request(options);
      const ticketGet = response.data;
      logger.info('Successfully created Ticket.');

      if (ticketGet.ticket_type === 'CHANGE_PASSWORD') {
        // send reset password link email
        const message = this.createForgotPasswordEmail((ticketGet as TicketGet).id, ticketCreate.email);
        await sgMail.send(message);
        logger.info('Sucessfully sent Reset Password email.');
      } else {
        // send email verification link email
        const message = this.createVerificationEmail((ticketGet as Auth0Ticket).ticket, ticketCreate.email);
        await sgMail.send(message);
        logger.info('Sucessfully sent Email Verification email.');
      }

      return ticketGet;
    } catch (error) {
      logger.error('Ticket Creation Failed.');
      if (error.response) {
        throw getErrorFromStatus(error.response.status, error.response.data.detail);
      } else {
        throw new InternalError(error.message);
      }
    }
  }


  async verifyTicket(ticketGet: TicketGet): Promise<TicketWithUserGet> {
    try {
      const token = await auth0Helper.getTokenForApi(this.accountSvcAudience);

      if (!this.isValidTicket(ticketGet)) {
        throw new BadRequest('Ticket is not valid');
      }

      const options: AxiosRequestConfig = {
        method: 'GET',
        url: `/users/${ticketGet.user_id}`,
        headers: {
          authorization: `Bearer ${token}`,
          'cache-control': 'no-cache',
        },
      };

      const userResponse: AxiosResponse<UserGet> = await this.axiosInstance.request(options);
      const user: UserGet = userResponse.data;

      const ticketWithUser: TicketWithUserGet = {
        id: ticketGet.id,
        user: {
          name: user.name,
          email: user.email,
        },
      };

      return ticketWithUser;
    } catch (error) {
      logger.error(`Ticket Verification Failed for ticket with id ${ticketGet.id}.`);
      throw error;
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

      const response: AxiosResponse<TicketGet> = await this.axiosInstance.request(options);
      const ticketGet: TicketGet = response.data;

      if (!this.isValidTicket(ticketGet)) {
        logger.error('Ticket Validation Failed.');
        throw new BadRequest(`Ticket with id ${id} is not valid.`);
      }

      // update password by PATCH to account-svc PATCH /users/
      options = {
        method: 'PATCH',
        url: `/users/${ticketGet.user_id}`,
        headers: {
          authorization: `Bearer ${token}`,
          'cache-control': 'no-cache',
          'If-Match': '*',
        },
        data: {
          password,
        },
      };

      const userResponse: AxiosResponse<UserGet> = await this.axiosInstance.request(options);
      const user: UserGet = userResponse.data;
      logger.info('Sucessfully updated User.');

      // update ticket to CLOSED
      options = {
        method: 'PATCH',
        url: `/user-tickets/${ticketGet.id}`,
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
      logger.info('Sucessfully closed Ticket.');

      const message = this.createPasswordUpdatedEmail(user.email);
      await sgMail.send(message);
      logger.info('Sucessfully sent Password Updated email.');

      return ticketResponse;
    } catch (error) {
      logger.error('Resetting Password Failed.');
      if (error.response) {
        throw getErrorFromStatus(error.response.status, error.response.data.detail);
      } else if (error instanceof BadRequest) {
        throw new BadRequest(error.message);
      } else {
        throw new InternalError(error.message);
      }
    }
  }

  createVerificationEmail(ticket: string, email: string): EmailCreate {
    const template = config.verificationEmailTemplate;
    const html = Mustache.render(template, {ticket});
    const message = {
      to: email,
      from: process.env.SENDGRID_EMAIL_FROM || 'support@twomatches.xyz',
      subject: 'Verify your email',
      html,
    };

    return message;
  }

  createForgotPasswordEmail(id: string, email: string): EmailCreate {
    const resetLink = `${process.env.CLIENT_HOST}/reset-password?ticket=${id}`;
    const template = config.forgotPasswordEmailTemplate;
    const html = Mustache.render(template, {resetLink});
    const message = {
      to: email,
      from: process.env.SENDGRID_EMAIL_FROM || 'support@twomatches.xyz',
      subject: 'Reset your password for localhost',
      html,
    };

    return message;
  }

  createPasswordUpdatedEmail(email: string): EmailCreate {
    const template = config.passwordUpdatedEmailTemplate;
    const html = Mustache.render(template, {});
    const message = {
      to: email,
      from: process.env.SENDGRID_EMAIL_FROM || 'support@twomatches.xyz',
      subject: 'Password updated for localhost successfully',
      html,
    };

    return message;
  }

  isValidTicket(userTicket: TicketGet): boolean {
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
