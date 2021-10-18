/* eslint-disable func-style */
import {Request, Response} from 'express';
import {HttpException, InternalError, PreconditionFailed, PreconditionRequired} from '@utils/HttpException';
import {Problem} from '@models/Problem';
import {logger} from '@middlewares/log/Logger';

const preconditionError = function(status: number, message: string, req: Request, res: Response) : void {
  let responseException : HttpException;
  if (status === 412) {
    responseException = new PreconditionFailed(message);
  } else if (status === 428) {
    responseException = new PreconditionRequired(message);
   // No Change to the resource
  } else if (status === 304) {
    res.sendStatus(status);
    return;
  } else {
    logger.error(`Could not identify the status code from preconditions middleware - ${status} - ${message}`);
    responseException = new InternalError('Internal Server Error');
  }
  const problem : Problem = {
    type: `/problem/${responseException.message.toLowerCase().replace(' ', '-')}`,
    title: responseException.message,
    status: responseException.code,
    detail: responseException.description,
    instance: `/problem/${responseException.message.toLowerCase().replace(' ', '-')}`,
  };
  res.status(responseException.code).json(problem);
};

const preconditionRequiredWith = ['PUT', 'PATCH'];

export const preconditionOptions = {
  error: preconditionError,
  requiredWith: preconditionRequiredWith,
};

