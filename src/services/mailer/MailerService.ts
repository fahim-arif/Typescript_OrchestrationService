import {SubscriberCreate, SubscriberGet} from '@models/mailer/Mailer';
import MailerRepository from '@repositories/mailer/MailerRepository';

export default class MailerService {
  private mailerRepository: MailerRepository;

  constructor() {
    this.mailerRepository = new MailerRepository();
  }

  async getSubscribers() : Promise<SubscriberGet[]> {
    try {
      const subscribers = this.mailerRepository.findAll();
      return subscribers;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getSubscriberById(id: string) : Promise<SubscriberGet> {
    try {
      const subscriber = this.mailerRepository.findById(id);
      return subscriber;
    } catch (error) {
      throw new Error(error.message);
    }

  }

  async createSubscriber(subscriberCreate: SubscriberCreate) : Promise<SubscriberGet> {
    try {
      const subscriber = this.mailerRepository.create(subscriberCreate);
      return subscriber;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
