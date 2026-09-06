import { FactoryProvider } from '@nestjs/common';
import { drizzle, MySql2Database } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import { ConfigService } from '@nestjs/config';
import * as schema from './schema/ShemaRegistry'; // تمام اسکیماهای طراحی شده فاز ۱

export const DRIZZLE_PROVIDER = 'DRIZZLE_PROVIDER';

// تعریف نوع (Type) دیتابیس به همراه تایپ اسکیماها برای Autocomplete هوشمند
export type DrizzleDB = MySql2Database<typeof schema>;

export const DrizzleProvider: FactoryProvider = {
    provide: DRIZZLE_PROVIDER,
    inject: [ConfigService], // تزریق سرویس تنظیمات
    useFactory: async (configService: ConfigService) =>
    {
        // ۱. ساخت استخر اتصالات MySQL
        const poolConnection = mysql.createPool({
            host: configService.get<string>('DB_HOST', 'localhost'),
            port: configService.get<number>('DB_PORT', 3306),
            user: configService.get<string>('DB_USER', 'root'),
            password: configService.get<string>('DB_PASSWORD', ''),
            database: configService.get<string>('DB_NAME', 'b2b_inventory'),
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
        });

        // ۲. اتصال Drizzle به Pool و معرفی اسکیماها
        return drizzle(poolConnection, {
            schema,
            mode: 'default',
        }) as DrizzleDB;
    },
};
