import {Joi} from 'express-validation';

export const resetPasswordValidation = {
  body: Joi.object({
    id: Joi.string()
                .required(),
    password: Joi.string()
                .required()
                .min(8)
                .max(255)
                .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/),
  }),
};
