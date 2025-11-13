/**
 * Domain Exception Filter
 *
 * Handles domain-specific exceptions and maps them to appropriate HTTP responses.
 * This filter catches domain errors and converts them to proper HTTP status codes.
 *
 * Key Principle:
 * Domain errors should be caught at the interface layer and converted to HTTP responses.
 * This keeps domain logic clean and framework-independent.
 */
import {
  InactiveUserError,
  InvalidCredentialsError,
  UserNotFoundError,
  UserAlreadyExistsError,
} from '@apps/auth/src/domain/errors';
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch(UserNotFoundError, InvalidCredentialsError, InactiveUserError, UserAlreadyExistsError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = exception.message;

    // Map domain errors to HTTP status codes
    if (exception instanceof UserNotFoundError) {
      statusCode = HttpStatus.NOT_FOUND;
    } else if (exception instanceof InvalidCredentialsError) {
      statusCode = HttpStatus.UNAUTHORIZED;
    } else if (exception instanceof InactiveUserError) {
      statusCode = HttpStatus.FORBIDDEN;
    } else if (exception instanceof UserAlreadyExistsError) {
      statusCode = HttpStatus.CONFLICT;
    }

    response.status(statusCode).json({
      statusCode,
      message,
      error: exception.constructor.name,
      timestamp: new Date().toISOString(),
    });
  }
}

