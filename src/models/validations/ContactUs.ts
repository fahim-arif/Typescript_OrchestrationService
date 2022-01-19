import {Joi} from 'express-validation';

export const contactUsValidation = {
  body: Joi.object({
    name: Joi.string()
      .required()
      .min(1)
      .max(255),
    email: Joi.string()
      .required()
      .email()
      .max(320),
    message: Joi.string()
      .min(1)
      .max(500),
    identifier: Joi.string().valid('about-page').required(),
  }),
};
