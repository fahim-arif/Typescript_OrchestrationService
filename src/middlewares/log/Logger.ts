import * as dotenv from 'dotenv';
import winston from 'winston';

dotenv.config();

// Security levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Set level per env
/* global process */
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = (env === 'development');
  return isDevelopment ? 'debug' : 'info';
};

  // Colours for level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};


winston.addColors(colors);

/**  TODO: Maybe need to update this format to Json for other streams*/
const format = winston.format.combine(
    winston.format.errors({stack: true}),
    winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss:ms'}),
    winston.format.colorize({all: true}),
    winston.format.printf(
      (info) => {
        if (info.stack) {
          return `${info.timestamp} [${info.level}]:  ${info.message} - ${info.stack}`;
        }
        return `${info.timestamp} [${info.level}]:  ${info.message}`;
      },
    ),
  );

// Need to add other transports later
const transports = [
  new winston.transports.Console(),
];

export const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  defaultMeta: {service: 'gateway-api'},
});
