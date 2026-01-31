/**
 * Base Usecase
 * Abstract base class for all application usecases
 *
 * Responsibilities:
 * - Define usecase interface (execute method)
 * - Handle error management
 * - Provide validation hooks
 * - Enable logging and monitoring
 *
 * Key Principle:
 * Usecases are application layer classes that orchestrate domain logic.
 * They coordinate between ports (repositories) and domain entities.
 */

export type UsecaseRequest = Record<string, unknown>;

export type UsecaseResponse = Record<string, unknown>;

/**
 * Base class for all usecases
 */
export abstract class BaseUsecase<
  TRequest extends UsecaseRequest,
  TResponse extends UsecaseResponse,
> {
  /**
   * Execute the usecase
   */
  abstract execute(request: TRequest): Promise<TResponse>;

  /**
   * Validate request (override in subclass if needed)
   */
  protected validate(request: TRequest): void {
    // Override in subclass
  }

  /**
   * Pre-execute hook (override in subclass if needed)
   */
  protected async beforeExecute(request: TRequest): Promise<void> {
    this.validate(request);
  }

  /**
   * Post-execute hook (override in subclass if needed)
   */
  protected async afterExecute(response: TResponse): Promise<void> {
    // Override in subclass
  }

  /**
   * Handle error (override in subclass if needed)
   */
  protected handleError(error: Error): void {
    console.error(`Usecase error: ${error.message}`, error);
  }

  /**
   * Execute with lifecycle hooks
   */
  protected async executeWithHooks(
    request: TRequest,
    executeFunction: (request: TRequest) => Promise<TResponse>,
  ): Promise<TResponse> {
    try {
      await this.beforeExecute(request);
      const response = await executeFunction(request);
      await this.afterExecute(response);
      return response;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.handleError(err);
      throw err;
    }
  }
}
