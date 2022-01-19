import sgMail from '@sendgrid/mail';
import Mustache from 'mustache';
import {InternalError} from '@utils/HttpException';
import {logger} from '@middlewares/log/Logger';
import {ContactUsCreate} from '@models/ContactUs';
import {EmailCreate} from '@models/Email';
import {LooseObject} from '@models/Common';

import config from '../../config.json';

export default class ContactUsService {

  constructor() {
    /* global process */
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_EMAIL_FROM || !process.env.SENDGRID_EMAIL_TO) {
      logger.error('Missing required details to send SendGrid email');
      throw new Error('Missing required details to send SendGrid email');
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendContactUsEmail(contactUsCreate: ContactUsCreate) : Promise<void> {
    try {
      const message = this.createContactUsEmail(contactUsCreate);
      await sgMail.send(message);
      logger.info('Sucessfully sent contact us inquiry email.');
      return;
    } catch (error) {
      logger.error('Failed to send contact us inquiry email.');
      throw new InternalError(error.message);
    }
  }

  createContactUsEmail(contactUsCreate: ContactUsCreate): EmailCreate {
    const {name, email, message, identifier} = contactUsCreate;

    const template = config.contactUsEmailTemplate;
    const html = Mustache.render(template, {name, email, message, identifier});

    const subject = (config.emailSubject as LooseObject)[identifier];

    const emailMessage = {
      to: process.env.SENDGRID_EMAIL_TO || 'support@twomatches.xyz',
      from: process.env.SENDGRID_EMAIL_FROM || 'support@twomatches.xyz',
      subject,
      html,
    };

    return emailMessage;
  }
}
