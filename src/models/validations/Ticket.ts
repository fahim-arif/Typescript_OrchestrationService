import {Joi} from 'express-validation';

export const ticketCreateValidation = {
  body: Joi.object({
    email: Joi.string()
                .email()
                .max(320)
                .required(),
    ticketType: Joi.string()
                .valid('CHANGE_PASSWORD', 'EMAIL_VERIFICATION'),
  }),
};
