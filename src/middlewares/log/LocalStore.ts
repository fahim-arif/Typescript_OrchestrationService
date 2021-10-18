import {AsyncLocalStorage} from 'async_hooks';

import {Request, Response, NextFunction} from 'express';
import {nanoid} from 'nanoid';


const asyncLocalStorage = new AsyncLocalStorage();

// Mapped Diagnostic contexts middleware
export const mdcMiddleware = (request: Request, response: Response, next: NextFunction) => {
  asyncLocalStorage.run(new Map(), async () => {

    try {
      const flow_id : unknown = (request.headers['x-flow-id']) ? request.headers['x-flow-id'] : nanoid(10);
      (<Map<string, unknown>>asyncLocalStorage
        .getStore())
        .set('flow-id', flow_id);

      next();
    } catch (error) {
      next(error);
    }
  });
};

export function getFlowId() : unknown {
  const store = <Map<string, unknown>>asyncLocalStorage.getStore();
  const result = store?.get('flow-id') || 'server';
  return result;
}

