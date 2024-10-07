import { Injectable, NestMiddleware } from '@nestjs/common';
import { DBService } from '@/common/modules/db/db.service';
import { JwtService } from '@/common/services/jwt/jwt.service';
import { NextFunction } from 'express';
import { User } from '@/entities/user.entity';

@Injectable()
export class GetUserMiddleware implements NestMiddleware {
  constructor(
    private readonly dbService: DBService,
    private readonly jwtService: JwtService,
  ) {}

  async use(req: Request & {user?: User}, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const bearerToken = authHeader.split(' ')[1]; // Extract the token part after 'Bearer '
  
    if (!bearerToken) {
      return next();
    }

    const token = await this.jwtService.verifyToken(bearerToken) as {userId: number}
    
    if (!token || !token.userId) {
      return next();
    }

    const user = await this.dbService.getUserById(token.userId)

    if (!user) {
      return next();
    }

    // Optionally, set the verified token on the request for further use in controllers
    req.user = user;

    next();
  }
}