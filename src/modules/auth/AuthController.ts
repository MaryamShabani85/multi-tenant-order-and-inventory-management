import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './services/AuthService';
import { RegisterDto } from './dto/RegisterTenantDto';
import { LoginDto } from './dto/LoginDto';

@Controller('auth') // مسیر پایه: /auth
export class AuthController
{
    // تزریق AuthService برای استفاده از منطق بیزینس
    constructor(private readonly authService: AuthService) { }

    @Post('register') // مسیر کامل: POST /auth/register
    async register(@Body() registerDto: RegisterDto)
    {
        return await this.authService.register(registerDto);
    }

    @Post('login') // مسیر کامل: POST /auth/login
    async login(@Body() loginDto: LoginDto)
    {
        return await this.authService.login(loginDto);
    }
}