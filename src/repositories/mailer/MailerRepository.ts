import {SubscriberCreate, SubscriberGet} from '@models/mailer/Mailer';
import {SubscriberStatus} from '@prisma/client';
import prisma from '@repositories/prisma/PrismaClient';
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

  async create(subcscriberCreate: SubscriberCreate) : Promise<SubscriberGet> {
    const {first_name, last_name, email, contact_no} = subcscriberCreate;

    const subscriber = await prisma.subscriber.create({
      data: {
        first_name,
        last_name,
        email,
        contact_no,
        status: SubscriberStatus.SUBSCRIBED,
      },
    });
    return subscriber;
  }


}
