import rateLimit from 'express-rate-limit';
import {RequestLimitExceeded} from '@utils/HttpException';

export const checkRateLimit = ({windowSizeMs = 60 * 1000, maxNumberOfRequests = 10} = {}) => {
  return rateLimit({
    windowMs: windowSizeMs,
    max: maxNumberOfRequests,
    handler: () => {
      throw new RequestLimitExceeded('Maximimum Request Limit Reached');
    },
  });
};

