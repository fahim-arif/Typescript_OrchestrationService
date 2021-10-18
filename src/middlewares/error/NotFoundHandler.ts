import {Request, Response, NextFunction} from 'express';
import {Problem} from '@models/Problem';

export const notFoundHandler = (
  request: Request,
  response: Response,
  // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
  next: NextFunction,
) => {

  const problem : Problem = {
    type: '/problem/resource-not-found',
    title: 'Resource not found',
    status: 404,
    detail: 'Resource not found',
    instance: '/problem/resource-not-found',
  };

  response.status(404).json(problem);
};
