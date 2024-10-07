import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@/common/services/jwt/jwt.service';
import { REQUEST } from '@nestjs/core';
import { CookieOptions, Request, Response } from 'express';

@Injectable()
export class CookieService {
  private readonly loginCookieName = 'DFUAHCO#812300sfAASFfs';

  constructor(
    @Inject(REQUEST) private readonly request: Request,
  ) {}
  
  private setCookie(response: Response, key: string, value: string, options?: CookieOptions) {
    response.cookie(key, value, {
      signed: true,
      httpOnly: true,
      ...options,
    });
  }

  setLoginCookie(response: Response, jwtToken: string) {
    // for 1 week
    this.setCookie(response, this.loginCookieName, jwtToken, {maxAge: 604800});
  }

  getLoginCookie(): string | null {
    const loginCookie = this.request.signedCookies[this.loginCookieName]

    if (!loginCookie) return null;

    return loginCookie;
  }

  removeLoginCookie(response: Response) {
    response.clearCookie(this.loginCookieName);
  }
}
