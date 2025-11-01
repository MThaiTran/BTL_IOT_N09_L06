import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from './constants.config';

export const JwtRootModule = JwtModule.register({
  global: true,
  secret: jwtConfig.SECRET,
  // signOptions: { expiresIn: jwtConfig.EXPIRED_IN as string }, // Uncomment this line to enable token expiration
});
