import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig: JwtModuleOptions = {
  secret: 'MY TOORBO UNREAL SECRET NOBODY KNOWS ABOUT',
  signOptions: { expiresIn: '7d' },
};