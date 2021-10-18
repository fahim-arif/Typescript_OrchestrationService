import { Joi } from "express-validation";

export const mailerValidation = {
  body: Joi.object({
    first_name: Joi.string()
      .required()
      .min(2)
      .max(255)
      .regex(/^[a-zA-Z .'-]+$/),
    last_name: Joi.string()
      .required()
      .min(1)
      .max(255)
      .regex(/^[a-zA-Z0-9 .'-]+$/),
    email: Joi.string().required().email().max(320),
    contact_no: Joi.string()
      .min(10)
      .max(15)
      .regex(/^\+[0-9]{1,14}$/),
  }),
};