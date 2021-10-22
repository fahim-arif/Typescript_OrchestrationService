import {Joi} from 'express-validation';

export const registerValidation = {
  body: Joi.object({
    name: Joi.string()
      .required()
      .min(2)
      .max(255)
      .regex(/^[a-zA-Z .'-]+$/),
    company_name: Joi.string()
      .required()
      .min(1)
      .max(255)
      .regex(/^[a-zA-Z0-9 .'-]+$/),
    email: Joi
      .string()
      .required()
      .email()
      .max(320),
    password: Joi.string()
      .required()
      .min(8)
      .max(255)
      .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/),
    receive_notifications: Joi
      .boolean()
      .required(),
  }),
};
