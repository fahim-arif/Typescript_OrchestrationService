export class HttpException extends Error {
  message: string;
  description: unknown;
  code: number;

  constructor(code: number, message: string, description?: unknown) {
    super(message);

    this.code = code || 500;
    this.message = message || 'Internal Server Error';
    this.description = description || null;
  }
}

export class BadRequest extends HttpException {
  constructor(description?: unknown) {
    super(400, 'Bad Request', description);
  }
}

export class Unauthorized extends HttpException {
  constructor(description?: string) {
    super(401, 'Unauthorized', description);
  }
}

export class Forbidden extends HttpException {
  constructor(description?: string) {
    super(403, 'Forbidden', description);
  }
}

export class NotFound extends HttpException {
  constructor(description?: string) {
    super(404, 'Not Found', description);
  }
}

export class Conflict extends HttpException {
  constructor(description?: string) {
    super(409, 'Conflict', description);
  }
}

export class PreconditionFailed extends HttpException {
  constructor(description?: string) {
    super(412, 'Precondition Failed', description);
  }
}

export class PreconditionRequired extends HttpException {
  constructor(description?: string) {
    super(428, 'Precondition Required', description);
  }
}

export class RequestLimitExceeded extends HttpException {
  constructor(description?: string) {
    super(429, 'Too Many Requests', description);
  }
}

export class InternalError extends HttpException {
  constructor(description?: string) {
    super(500, 'Internal Server Error', description);
  }
}

export class ServiceUnavailable extends HttpException {
  constructor(description?: string) {
    super(503, 'Service Unavailable', description);
  }
}

export function getErrorFromStatus(status: number, description? : string) : HttpException {
  switch (status) {
    case 400:
      return new BadRequest(description);

    case 401:
      return new Unauthorized(description);

    case 403:
      return new Forbidden(description);

    case 404:
      return new NotFound(description);

    case 409:
      return new Conflict(description);

    case 412:
      return new PreconditionFailed(description);

    case 428:
      return new PreconditionRequired(description);

    case 503:
      return new ServiceUnavailable(description);

    case 500:
    default:
      return new InternalError(description);
  }
}
