import {SubscriberCreate, SubscriberGet} from '@models/Mailer';
import MailerRepository from '@repositories/mailer/MailerRepository';
import {InternalError, NotFound} from '@utils/HttpException';

export default class MailerService {
  private mailerRepository: MailerRepository;

  constructor(mailerRepository: MailerRepository) {
    this.mailerRepository = mailerRepository;
  }

  async getSubscribers() : Promise<SubscriberGet[]> {
    try {
      const subscribers = this.mailerRepository.findAll();
      return subscribers;
    } catch (error) {
      throw new InternalError(error.message);
    }
  }

  async getSubscriberById(id: string) : Promise<SubscriberGet> {
    try {
      const subscriber = this.mailerRepository.findById(id);
      return subscriber;
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      } else {
        throw new InternalError(error.message);
      }
    }
  }

  async createSubscriber(subscriberCreate: SubscriberCreate) : Promise<SubscriberGet> {
    try {
      const subscriber = this.mailerRepository.create(subscriberCreate);
      return subscriber;
    } catch (error) {
      throw new InternalError(error.message);
    }
  }
}
