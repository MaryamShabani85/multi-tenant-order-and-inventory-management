// src/modules/auth/AuthModule.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services/AuthService';
import { PasswordService } from './services/PasswordService';
import { DatabaseModule } from '../../database/DatabaseModule';
import { AuthController } from './AuthController';

@Module({
    imports: [
        DatabaseModule,
        // تنظیمات ساخت توکن JWT
        JwtModule.register({
            global: true, // در دسترس بودن JwtService در کل برنامه
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '1d' }, // انقضای توکن: ۱ روز
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, PasswordService],
    exports: [AuthService, PasswordService],
})
export class AuthModule { }