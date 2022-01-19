import {Joi} from 'express-validation';
import {commonPasswordSet} from '@utils/10k-most-common';

export const registerValidation = {
  body: Joi.object({
    name: Joi.string()
      .required()
      .min(2)
      .max(255)
      .regex(/^[a-zA-Z .'-]+$/),
    company_name: Joi.string()
      .required()
      .min(2)
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
  })
  .custom((obj) => {
    const {name, email, password} = obj;
    const firstPartOfEmail = email.split('@')[0];

    if (password.toLowerCase().includes(name.toLowerCase())) {
      throw new Error('password must not contain value of name field');
    } else if (password.toLowerCase().includes(firstPartOfEmail.toLowerCase())) {
      throw new Error('password must not contain first part of email field - firstpart@example.com');
    } else if (commonPasswordSet.has(password)) {
      throw new Error('password must not be a common word');
    } else {
      return true;
    }
  }, 'Password check'),
};
