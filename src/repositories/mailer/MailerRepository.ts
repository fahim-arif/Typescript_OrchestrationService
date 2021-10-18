import {SubscriberCreate, SubscriberGet} from '@models/Mailer';
import {SubscriberStatus} from '@prisma/client';
import prisma from '@repositories/prisma/PrismaClient';
import {logger} from '@middlewares/log/Logger';
import {NotFound} from '@utils/HttpException';

export default class MailerRepository {

  async findAll(): Promise<SubscriberGet[]> {
    const subscribers = await prisma.subscriber.findMany();
    return subscribers;
  }

  async findById(id: string) : Promise<SubscriberGet> {
    const subscriber = await prisma.subscriber.findUnique({
      where: {
        id,
      },
    });
    if (subscriber) {
      return subscriber;
    } else {
      throw new NotFound('Resource not found');
    }

  }

  async findByEmail(email: string) : Promise<SubscriberGet> {
    const subscriber = await prisma.subscriber.findUnique({
      where: {
        email,
      },
    });
    if (subscriber) {
      return subscriber;
    } else {
      throw new NotFound('Resource not found');
    }

  }

  async create(subcscriberCreate: SubscriberCreate) : Promise<SubscriberGet> {
    const {first_name, last_name, email, contact_no} = subcscriberCreate;
    let subscriber;
    try {
      subscriber = await this.findByEmail(email);
      if (subscriber) {
        logger.info(`Subscriber with email ${email} found.Will not create new subscriber`);
        return subscriber;
      }
    } catch (error) {
      if (error instanceof NotFound) {
        logger.info(`Subscriber with email ${email} not present. Creating  new one`);
      } else {
        throw error;
      }
    }


    if (!subscriber) {
      subscriber = await prisma.subscriber.create({
        data: {
          first_name,
          last_name,
          email,
          contact_no,
          status: SubscriberStatus.SUBSCRIBED,
        },
      });
    }
    return subscriber;
  }


}
