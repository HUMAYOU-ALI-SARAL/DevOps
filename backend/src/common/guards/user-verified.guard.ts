import { Injectable, CanActivate, ExecutionContext, Inject, UnauthorizedException, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { DBService } from '@/common/modules/db/db.service';
import { JwtService } from '@/common/services/jwt/jwt.service';

@Injectable()
export class UserVerifiedGuard implements CanActivate {
  constructor(
    private readonly dbService: DBService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Extract Bearer token from the Authorization header
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid or missing Bearer token');
    }

    const bearerToken = authHeader.split(' ')[1]; // Extract the token part after 'Bearer '
  
    if (!bearerToken) {
      throw new UnauthorizedException('Invalid or missing Bearer token');
    }

    const token = await this.jwtService.verifyToken(bearerToken) as {userId: number}
    
    if (!token || !token.userId) {
      throw new UnauthorizedException('Unauthorized access');
    }

    const user = await this.dbService.getUserById(token.userId)

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (!user.verified) {
      throw new ForbiddenException('User is not verified');
    }

    request.user = user;

    return true;
  }
}