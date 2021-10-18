// Credits - https://levelup.gitconnected.com/better-logs-for-expressjs-using-winston-and-morgan-with-typescript-1c31c1ab9342

import * as dotenv from 'dotenv';
import morgan, {StreamOptions} from 'morgan';
import {logger} from '@middlewares/log/Logger';

dotenv.config();

// Override the stream method by telling
// Morgan to use our custom logger instead of the console.log.
const stream: StreamOptions = {
  // Use the http severity
  write: (message) => logger.http(message),
};

// Skip all the Morgan http log if the
// application is not running in development mode.
// This method is not really needed here since
// we already told to the logger that it should print
// only warning and error messages in production.
/* global process */
const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env !== 'development';
};

// Build the morgan middleware
const morganMiddleware = morgan(
  // Define message format string (this is the default one).
  // The message format is made from tokens, and each token is
  // defined inside the Morgan library.
  // You can create your custom token to show what do you want from a request.
  // ':method :url client :req[x-client-id] :status :res[content-length] - :response-time ms',
  'remote(:remote-addr :remote-user) ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms ":referrer" ":user-agent"',
  // Options: in this case, I overwrote the stream and the skip logic.
  // See the methods above.
  {stream, skip},
);

export default morganMiddleware;
