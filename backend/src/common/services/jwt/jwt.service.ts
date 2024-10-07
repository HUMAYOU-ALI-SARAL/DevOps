import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { jwtConfig } from './jwt.config';

@Injectable()
export class JwtService {
  private readonly jwtService: NestJwtService;

  constructor() {
    this.jwtService = new NestJwtService(jwtConfig);
  }

  async generateToken(payload: any): Promise<string> {
    return await this.jwtService.signAsync(payload);
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token, { secret: jwtConfig.secret });
    } catch (error) {
      return null;
    }
  }
}