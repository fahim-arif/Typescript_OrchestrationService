import {SubscriberStatus} from '@prisma/client';

export interface SubscriberCreate {
    email: string;
    first_name: string;
    last_name: string;
    contact_no?: string | null;
    status: SubscriberStatus
}

export interface SubscriberGet extends SubscriberCreate {
    id: string;
    subscribe_date: Date;
    unsubscribe_date?: Date | null;
}
