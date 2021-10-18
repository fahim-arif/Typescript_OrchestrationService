import {Joi} from 'express-validation';

export const idValidSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const queryValidation = {
  query: Joi.object({
    fields: Joi.array().min(1).items(Joi.string()),
    query: Joi.object(),
    limit: Joi.number().min(1).max(100),
    offset: Joi.number().min(1),
    sort: Joi.string().pattern(/^[-+][a-z0-9_]+$/),
  }),
};
