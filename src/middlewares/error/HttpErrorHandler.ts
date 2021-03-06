import {Request, Response, NextFunction} from 'express';
import {ValidationError} from 'express-validation';
import {UnauthorizedError} from 'express-jwt';
import {PrismaException} from '@utils/PrismaException';
import {BadRequest, HttpException, InternalError, getErrorFromStatus, Forbidden, NotFound, Unauthorized} from '@utils/HttpException';
import {Problem} from '@models/Problem';
import {logger} from '@middlewares/log/Logger';

interface ExpressError extends Error{
  statusCode: number;
}


export const httpErrorHandler = (
    error: HttpException | ValidationError,
    request: Request,
    response: Response,
    // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
    next: NextFunction,
  ) => {
  logger.error('In HTTP Error Handler.Check the stack trace of the below error');
  logger.error(error);
  const responseException = convertToHttpException(error);
  const problem : Problem = {
    type: `/problem/${responseException.message.toLowerCase().replace(' ', '-')}`,
    title: responseException.message,
    status: responseException.code,
    detail: responseException.description,
    instance: `/problem/${responseException.message.toLowerCase().replace(' ', '-')}`,
  };
  response.status(responseException.code).json(problem);
};

function convertToHttpException(error : ValidationError | Error | HttpException) : HttpException {
  if (error instanceof InternalError) {
    logger.error(`Internal Error Description ${error.description}`);
    return new InternalError('Internal Server Error');
  } else if (error instanceof HttpException) {
    return error;
  } else if (error instanceof UnauthorizedError) {
    logger.error(`Request failed during Authorization check - ${error.message}`);
    return new Unauthorized('Invalid JWT token');
  } else if (error instanceof ValidationError) {
    return new BadRequest(error.details);
   // This cases handles error generated by express itself like SyntaxError
  } else if (error instanceof PrismaException) {
    logger.error('Error from prisma client');
    logger.error(error);
    return convertPrismaException(error);
  } else if (error instanceof Error) {
    logger.error('Express Error');
    logger.error(error);
    const expressError = <ExpressError>error;
    return getErrorFromStatus(expressError.statusCode, 'Internal Server Error');
    // This case handles Forbidden from express-jwt-authz which does not  send
    // proper typescript object
  // eslint-disable-next-line dot-notation
  } else if (error['statusCode'] === 403) {
    // eslint-disable-next-line dot-notation
    return new Forbidden(error['message']);
  }
  logger.error('Could not identify the type of error correctly');
  logger.error(error);
  return new InternalError('Backend Error');
}

function convertPrismaException(error : PrismaException) : HttpException {
  if (error.code === 'P2015' || error.code === 'P2001' || error.code === 'P2003' || error.message.toLowerCase().includes('not found')) {
    return new NotFound('Record Not Found');
  } else {
    return new InternalError('Internal Server Error');
  }
}
