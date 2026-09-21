// auth.service.ts
import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from './PasswordService';
import * as schema from '../../../database/schema/ShemaRegistry'; // تمام اسکیماهای طراحی شده فاز ۱
import { MySql2Database } from 'drizzle-orm/mysql2';
import { LoginDto } from '../dto/LoginDto';
import { eq } from 'drizzle-orm';
import { RegisterDto } from '../dto/RegisterTenantDto';
import { TenantStatusEnum } from '../../../enum/TenantStatusEnum';
import { UserRoleEnum } from '../../../enum/UserRoleEnum';
import { ulid } from 'ulid';
import { DRIZZLE_PROVIDER } from '../../../database/DrizzleProvider';

@Injectable()
export class AuthService
{
    constructor(
        @Inject(DRIZZLE_PROVIDER) private readonly db: MySql2Database<typeof schema>,
        private readonly jwtService: JwtService,
        private readonly passwordService: PasswordService,
    ) { }

    async login(userLogin: LoginDto)
    {
        let users = schema.UsersSchema;

        const [user] = await this.db.select().from(users).where(eq(users.email, userLogin.email)).limit(1);
        if (!user)
            throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه هست');
        let isPasswordValid = await this.passwordService.verifyCompare(userLogin.password, user.passwordHash);

        if (!isPasswordValid)
        {
            throw new UnauthorizedException('ایمیل یا کلمه عبور اشتباه است.');
        }

        // ۴. ساخت Payload برای توکن JWT (اطلاعات ضروری مثل ID، نقش و Tenant ID)
        const payload = {
            sub: user.id,
            email: user.email,
            tenantId: user.tenantId, // با توجه به معماری Multi-tenant پروژه
            role: user.role,
        };

        // ۵. تولید و بازگشت توکن
        const accessToken = await this.jwtService.signAsync(payload);

        return {
            accessToken: accessToken,
            user: {
                id: user.id,
                email: user.email,
                tenantId: user.tenantId,
            },
        };
    }

    async register(userRegister: RegisterDto)
    {
        const users = schema.UsersSchema;
        const tenants = schema.TenantsSchema;

        // ۱. بررسی یکتا بودن (قبل تراکنش تا زود هنگام تو گاه انجام شود)
        const existingUser = await this.db.query.UsersSchema.findFirst({
            where: eq(users.email, userRegister.user.email),
        });
        if (existingUser)
        {
            throw new ConflictException('این ایمیل قبلاً ثبت شده است.');
        }

        const existingTenant = await this.db.query.TenantsSchema.findFirst({
            where: eq(tenants.slug, userRegister.tenant.slug),
        });
        if (existingTenant)
        {
            throw new ConflictException('این شناسه سازمان (slug) قبلاً رزرو شده است.');
        }

        const hashedPassword = await this.passwordService.hash(userRegister.user.password);

        const tenantId = ulid();
        const userId = ulid();

        // ۲. عملیات در یک تراکنش: یا هر دو ثبت، یا هیچ‌کدوم
        return await this.db.transaction(async (tx) =>
        {

            // الف) درج تنانت
            await tx.insert(tenants).values({
                id: tenantId,
                name: userRegister.tenant.name,
                slug: userRegister.tenant.slug,
                status: userRegister.tenant.status ?? TenantStatusEnum.ACTIVE,
            });

            // ب) درج کاربر مدیر مرتبط به این تنانت
            await tx.insert(users).values({
                id: userId,
                tenantId: tenantId,
                email: userRegister.user.email,
                passwordHash: hashedPassword,
                fullName: userRegister.user.fullName,
                role: userRegister.user.role ?? UserRoleEnum.TENANT_ADMIN,
            });

            // اگر این‌جا به خطا خورد → کل Rollback
            return {
                message: 'ثبت‌نام سازمان و مدیر با موفقیت انجام شد.',
                tenantId,
                userId,
            };
        });
    }
}
