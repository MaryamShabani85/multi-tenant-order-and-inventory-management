import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TenantMiddleware } from './infrastructure/context/TenantMiddleware';
import { DatabaseModule } from './database/DatabaseModule';
import { TenantModule } from './core/tenant/TenantModule';

@Module({
  imports: [
    DatabaseModule,
    TenantModule
  ],
  controllers: [AppController],
  providers: [AppService],
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