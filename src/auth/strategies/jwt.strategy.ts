import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: any) {
    // payload; // enter into req.user
    /**
     * payload is a JWT content payload while login :
     * {
     *    sub: uuid,
     *    username: string,
     *    role: string,
     *    iat: number,
     *    exp: number,
     * }
     */
    return {
      sub: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}
