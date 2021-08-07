"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getErrorFromStatus = exports.ServiceUnavailable = exports.InternalError = exports.PreconditionRequired = exports.PreconditionFailed = exports.Conflict = exports.NotFound = exports.Forbidden = exports.Unauthorized = exports.BadRequest = exports.HttpException = void 0;
class HttpException extends Error {
    constructor(code, message, description) {
        super(message);
        this.code = code || 500;
        this.message = message || 'Internal Server Error';
        this.description = description || null;
    }
}
exports.HttpException = HttpException;
class BadRequest extends HttpException {
    constructor(description) {
        super(400, 'Bad Request', description);
    }
}
exports.BadRequest = BadRequest;
class Unauthorized extends HttpException {
    constructor(description) {
        super(401, 'Unauthorized', description);
    }
}
exports.Unauthorized = Unauthorized;
class Forbidden extends HttpException {
    constructor(description) {
        super(403, 'Forbidden', description);
    }
}
exports.Forbidden = Forbidden;
class NotFound extends HttpException {
    constructor(description) {
        super(404, 'Not Found', description);
    }
}
exports.NotFound = NotFound;
class Conflict extends HttpException {
    constructor(description) {
        super(409, 'Conflict', description);
    }
}
exports.Conflict = Conflict;
class PreconditionFailed extends HttpException {
    constructor(description) {
        super(412, 'Precondition Failed', description);
    }
}
exports.PreconditionFailed = PreconditionFailed;
class PreconditionRequired extends HttpException {
    constructor(description) {
        super(428, 'Precondition Required', description);
    }
}
exports.PreconditionRequired = PreconditionRequired;
class InternalError extends HttpException {
    constructor(description) {
        super(500, 'Internal Server Error', description);
    }
}
exports.InternalError = InternalError;
class ServiceUnavailable extends HttpException {
    constructor(description) {
        super(503, 'Service Unavailable', description);
    }
}
exports.ServiceUnavailable = ServiceUnavailable;
function getErrorFromStatus(status, description) {
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
exports.getErrorFromStatus = getErrorFromStatus;
//# sourceMappingURL=HttpException.js.map