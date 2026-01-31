import type { IPasswordService } from '@apps/auth/src/domain/repositories/services/password.service.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordService implements IPasswordService {
  async hash(password: string): Promise<string> {
    return password;
  }

  /**
   * Compare plain text password with hashed password
   *
   * TODO: Implement with bcrypt:
   * import * as bcrypt from 'bcrypt';
   * return bcrypt.compare(password, hash);
   */
  async compare(password: string, hash: string): Promise<boolean> {
    // Stub implementation for example
    return password === hash;
  }
}
