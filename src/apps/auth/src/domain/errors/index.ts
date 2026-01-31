/**
 * Domain Errors
 * Exceptions specific to the business domain (not HTTP errors).
 * These represent violations of business rules.
 */

export class UserNotFoundError extends Error {
  constructor(message = 'User not found') {
    super(message);
    this.name = 'UserNotFoundError';
  }
}

export class InvalidCredentialsError extends Error {
  constructor(message = 'Invalid credentials') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}

export class UserAlreadyExistsError extends Error {
  constructor(message = 'User already exists') {
    super(message);
    this.name = 'UserAlreadyExistsError';
  }
}

export class InactiveUserError extends Error {
  constructor(message = 'User account is inactive') {
    super(message);
    this.name = 'InactiveUserError';
  }
}
