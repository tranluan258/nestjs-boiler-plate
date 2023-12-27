import { DynamicModule, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { AuthOptions } from './interface/auth.options';
import { ACCOUNT_SERVICE } from './constant/constant';

@Module({})
export class AuthModule {
  static forRoot(options: AuthOptions): DynamicModule {
    return {
      module: AuthModule,
      imports: [
        PassportModule,
        JwtModule.registerAsync({
          useFactory: () => ({
            secret: options.jwtSectet,
            signOptions: { expiresIn: '1d' },
          }),
        }),
        ...options.imports,
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        LocalStrategy,
        JwtStrategy,
        {
          provide: ACCOUNT_SERVICE,
          useFactory: options.useFactory,
          inject: options.inject,
        },
      ],
    };
  }
}
