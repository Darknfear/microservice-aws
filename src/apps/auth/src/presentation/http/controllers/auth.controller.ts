/**
 * Auth Controller (Public API)
 *
 * PUBLIC routes exposed via API Gateway
 * These endpoints are accessible to external clients
 *
 * Route Pattern: /api/auth/*
 *
 * CQRS Pattern:
 * - POST/PUT/DELETE requests → Command Handlers (Write Side)
 * - GET requests → Query Handlers (Read Side)
 *
 * Key Changes:
 * - Controllers now use Command Handlers for writes
 * - Controllers now use Query Handlers for reads
 * - Separation of concerns: Write Model vs Read Model
 */
import { Body, Controller, HttpCode, HttpStatus, Post, UseFilters } from '@nestjs/common';
import { SignInRequestDto, SignInResponseDto } from '../dtos';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';

// Command Handlers (Write Side)
import { ChangePasswordCommandHandler } from '@apps/auth/src/application/commands/handlers/change-password.command-handler';
import { CreateUserCommandHandler } from '@apps/auth/src/application/commands/handlers/create-user.command-handler';
import { SignInCommandHandler } from '@apps/auth/src/application/commands/handlers/sign-in.command-handler';

// Commands
import { ChangePasswordCommand } from '@apps/auth/src/application/commands/change-password.command';
import { CreateUserCommand } from '@apps/auth/src/application/commands/create-user.command';
import { SignInCommand } from '@apps/auth/src/application/commands/sign-in.command';

@Controller('api/auth') // Public API routes
@UseFilters(DomainExceptionFilter)
export class AuthController {
  constructor(
    // Command Handlers (Write Side)
    private readonly signInCommandHandler: SignInCommandHandler,
    private readonly createUserCommandHandler: CreateUserCommandHandler,
    private readonly changePasswordCommandHandler: ChangePasswordCommandHandler,
  ) {}

  /**
   * COMMAND: POST /auth/register
   * Create a new user
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: { username: string; email: string; password: string },
  ): Promise<{ userId: string; username: string; email: string; message: string }> {
    const command = new CreateUserCommand(dto.username, dto.email, dto.password);
    const result = await this.createUserCommandHandler.execute(command);

    return {
      userId: result.userId,
      username: result.username,
      email: result.email,
      message: result.message,
    };
  }

  /**
   * COMMAND: POST /auth/sign-in
   * Sign in a user with username and password
   */
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() dto: SignInRequestDto): Promise<SignInResponseDto> {
    // Create command
    const command = new SignInCommand(dto.username, dto.password);

    // Execute command (Write Side)
    const result = await this.signInCommandHandler.execute(command);

    return {
      userId: result.userId!,
      username: result.username!,
      email: result.email!,
      isActive: true,
    };
  }

  /**
   * COMMAND: POST /auth/change-password
   * Change user password
   */
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Body() dto: { userId: string; currentPassword: string; newPassword: string },
  ): Promise<{ message: string }> {
    const command = new ChangePasswordCommand(dto.userId, dto.currentPassword, dto.newPassword);
    const result = await this.changePasswordCommandHandler.execute(command);

    return {
      message: result.message,
    };
  }
}
