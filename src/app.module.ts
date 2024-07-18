import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { PermissionModule } from './permission/permission.module';
import { RoleModule } from './role/role.module';
import { AccountModule } from './account/account.module';
import { PolicyModule } from './policy/policy.module';
import { AccountService } from './account/account.service';
import { AuthModule } from '@app/auth';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.' + process.env.NODE_ENV ?? 'local',
      load: [configuration],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    PermissionModule,
    RoleModule,
    AccountModule,
    PolicyModule,
    AuthModule.forRoot({
      imports: [AccountModule],
      inject: [AccountService],
      useFactory: (accountService: AccountService) => accountService,
      jwtSecret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
