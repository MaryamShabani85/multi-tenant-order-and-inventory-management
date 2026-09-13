import { Injectable } from '@nestjs/common';
import { hash, verify } from 'argon2';

@Injectable()
export class PasswordService
{
    /**
     * هش کردن پسورد خام کاربر
     */
    async hash(password: string): Promise<string>
    {
        return await hash(password);
    }

    /**
     * مقایسه پسورد خام ورودی با هشی که از دیتابیس خوانده شده
     */
    async verifyCompare(password: string, hashedPassword: string): Promise<boolean>
    {
        return await verify(hashedPassword, password);
    }
}