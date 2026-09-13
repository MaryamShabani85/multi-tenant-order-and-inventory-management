import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './AppController';
import { AppService } from './AppService';
import { TenantMiddleware } from './infrastructure/context/TenantMiddleware';
import { DatabaseModule } from './database/DatabaseModule';
import { TenantModule } from './core/tenant/TenantModule';
import { AuthModule } from './modules/auth/AuthModule';
import { APP_GUARD } from '@nestjs/core';
import { JWTAuthGuard } from './common/guard/JWTAuthGuard';

@Module({
  imports: [
    DatabaseModule,
    TenantModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: JWTAuthGuard,
    }
  ],
})
export class AppModule implements NestModule
{
  configure(consumer: MiddlewareConsumer)
  {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        { path: 'health', method: RequestMethod.GET },
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/register-tenant', method: RequestMethod.POST }, // ثبت‌نام شرکت جدید
        'docs/(.*)', // اگر از Swagger استفاده می‌کنی
      )
      .forRoutes('*'); // روی بقیه تمام مسیرها اعمال شود
  }
}