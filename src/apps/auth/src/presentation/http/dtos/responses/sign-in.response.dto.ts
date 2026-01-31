/**
 * Sign In Response DTO
 *
 * Data Transfer Object for sign-in responses
 */
export class SignInResponseDto {
  /**
   * User ID
   */
  userId!: string;

  /**
   * Username
   */
  username!: string;

  /**
   * Email
   */
  email!: string;

  /**
   * Is active flag
   */
  isActive!: boolean;
}
