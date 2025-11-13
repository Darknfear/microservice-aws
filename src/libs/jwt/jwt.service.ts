/**
 * JWT Service
 * Shared library for JWT token generation and verification
 * Used across all microservices
 *
 * Responsibilities:
 * - Generate access tokens
 * - Generate refresh tokens
 * - Verify tokens
 * - Decode tokens
 * - Handle token expiration
 */

import { Injectable } from '@nestjs/common';
import type { SignOptions } from 'jsonwebtoken';
import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string; // subject (user ID)
  username: string;
  email: string;
  iat?: number; // issued at
  exp?: number; // expiration time
}

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class JwtService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpire: string;
  private readonly refreshTokenExpire: string;

  constructor() {
    // In production, these should come from environment variables
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'access-secret-key';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'refresh-secret-key';
    this.accessTokenExpire = process.env.JWT_ACCESS_EXPIRE || '15m';
    this.refreshTokenExpire = process.env.JWT_REFRESH_EXPIRE || '7d';
  }

  /**
   * Generate both access and refresh tokens
   */
  generateTokens(payload: Omit<JwtPayload, 'iat' | 'exp'>): JwtTokens {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    // Calculate expires in seconds
    const expiresIn = this.parseExpireTime(this.accessTokenExpire);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  /**
   * Generate access token (short-lived)
   */
  generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.parseExpireTime(this.accessTokenExpire),
      algorithm: 'HS256',
    } as SignOptions);
  }

  /**
   * Generate refresh token (long-lived)
   */
  generateRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.parseExpireTime(this.refreshTokenExpire),
      algorithm: 'HS256',
    } as SignOptions);
  }

  /**
   * Verify and decode access token
   */
  verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.accessTokenSecret) as JwtPayload;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Invalid or expired access token: ${message}`);
    }
  }

  /**
   * Verify and decode refresh token
   */
  verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.refreshTokenSecret) as JwtPayload;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Invalid or expired refresh token: ${message}`);
    }
  }

  /**
   * Decode token without verification (use with caution)
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload | null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Convert expire time string to seconds
   * Examples: '15m' -> 900, '7d' -> 604800
   */
  private parseExpireTime(expireTime: string): number {
    const unit = expireTime.slice(-1);
    const value = parseInt(expireTime.slice(0, -1), 10);

    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
      w: 604800,
    };

    return value * (multipliers[unit] || 1);
  }
}
