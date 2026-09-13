import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './AuthService';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from './PasswordService';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { TenantStatusEnum } from '../../../enum/TenantStatusEnum';
import { UserRoleEnum } from '../../../enum/UserRoleEnum';

describe('AuthService', () =>
{
    let authService: AuthService;
    let jwtService: jest.Mocked<JwtService>;
    let passwordService: jest.Mocked<PasswordService>;

    // آبجکت تراکنش جعلی برای Drizzle
    const mockTx = {
        insert: jest.fn().mockReturnThis(),
        values: jest.fn().mockResolvedValue(undefined),
    };

    // کلاینت دیتابیس جعلی Drizzle
    const mockDb = {
        select: jest.fn(),
        query: {
            UsersSchema: {
                findFirst: jest.fn(),
            },
            TenantsSchema: {
                findFirst: jest.fn(),
            },
        },
        transaction: jest.fn((callback) => callback(mockTx)),
    };

    beforeEach(async () =>
    {
        // پاک کردن لاگ صدا زده شدن ماک‌ها قبل از هر تست
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: 'DRIZZLE_PROVIDER',
                    useValue: mockDb,
                },
                {
                    provide: JwtService,
                    useValue: {
                        signAsync: jest.fn(),
                    },
                },
                {
                    provide: PasswordService,
                    useValue: {
                        verifyCompare: jest.fn(),
                        hash: jest.fn(),
                    },
                },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        jwtService = module.get(JwtService);
        passwordService = module.get(PasswordService);
    });

    it('should be defined', () =>
    {
        expect(authService).toBeDefined();
    });

    describe('login', () =>
    {
        const mockLoginDto = {
            email: 'test@example.com',
            password: 'Password123!',
        };

        const mockUserInDb = {
            id: '01HR0000000000000000000001',
            email: 'test@example.com',
            passwordHash: 'hashed_password',
            tenantId: '01HR0000000000000000000000',
            role: UserRoleEnum.TENANT_ADMIN,
        };

        it('باید در صورت صحت اطلاعات، توکن JWT و دیتای کاربر را برگرداند', async () =>
        {
            // شبیه‌سازی زنجیره Drizzle: db.select().from().where().limit()
            mockDb.select.mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue([mockUserInDb]),
                    }),
                }),
            });

            passwordService.verifyCompare.mockResolvedValue(true);
            jwtService.signAsync.mockResolvedValue('mocked_jwt_token');

            const result = await authService.login(mockLoginDto);

            expect(result).toEqual({
                accessToken: 'mocked_jwt_token',
                user: {
                    id: mockUserInDb.id,
                    email: mockUserInDb.email,
                    tenantId: mockUserInDb.tenantId,
                },
            });
            expect(passwordService.verifyCompare).toHaveBeenCalledWith(
                mockLoginDto.password,
                mockUserInDb.passwordHash,
            );
            expect(jwtService.signAsync).toHaveBeenCalledWith({
                sub: mockUserInDb.id,
                email: mockUserInDb.email,
                tenantId: mockUserInDb.tenantId,
                role: mockUserInDb.role,
            });
        });

        it('اگر کاربر در دیتابیس وجود نداشت باید UnauthorizedException پرتاب کند', async () =>
        {
            mockDb.select.mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue([]), // کاربری یافت نشد
                    }),
                }),
            });

            await expect(authService.login(mockLoginDto)).rejects.toThrow(
                UnauthorizedException,
            );
        });

        it('اگر رمز عبور اشتباه بود باید UnauthorizedException پرتاب کند', async () =>
        {
            mockDb.select.mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue([mockUserInDb]),
                    }),
                }),
            });

            passwordService.verifyCompare.mockResolvedValue(false); // رمز نادرست است

            await expect(authService.login(mockLoginDto)).rejects.toThrow(
                UnauthorizedException,
            );
        });
    });

    describe('register', () =>
    {
        const mockRegisterDto = {
            user: {
                email: 'owner@shop.com',
                password: 'Password123!',
                fullName: 'Mary Doe',
                role: UserRoleEnum.TENANT_ADMIN,
            },
            tenant: {
                name: 'Digi Shop',
                slug: 'digi-shop',
                status: TenantStatusEnum.ACTIVE,
            },
        };

        it('اگر ایمیل تکراری باشد باید ConflictException پرتاب کند', async () =>
        {
            mockDb.query.UsersSchema.findFirst.mockResolvedValue({ id: 'existing_id' });

            await expect(authService.register(mockRegisterDto)).rejects.toThrow(
                ConflictException,
            );
            expect(mockDb.transaction).not.toHaveBeenCalled(); // تراکنش اصلاً نباید شروع شود
        });

        it('اگر شناسه سازمان (slug) تکراری باشد باید ConflictException پرتاب کند', async () =>
        {
            mockDb.query.UsersSchema.findFirst.mockResolvedValue(null);
            mockDb.query.TenantsSchema.findFirst.mockResolvedValue({ id: 'existing_tenant_id' });

            await expect(authService.register(mockRegisterDto)).rejects.toThrow(
                ConflictException,
            );
            expect(mockDb.transaction).not.toHaveBeenCalled();
        });

        it('باید تراکنش ثبت تنانت و کاربر مدیر را با موفقیت اجرا کند', async () =>
        {
            mockDb.query.UsersSchema.findFirst.mockResolvedValue(null);
            mockDb.query.TenantsSchema.findFirst.mockResolvedValue(null);
            passwordService.hash.mockResolvedValue('hashed_secret_password');

            const result = await authService.register(mockRegisterDto);

            expect(result).toHaveProperty('message');
            expect(result).toHaveProperty('tenantId');
            expect(result).toHaveProperty('userId');

            // اطمینان از اینکه عملیات حتماً داخل تراکنش انجام شده است
            expect(mockDb.transaction).toHaveBeenCalledTimes(1);
            expect(mockTx.insert).toHaveBeenCalledTimes(2); // یک‌بار تنانت، یک‌بار کاربر
        });
    });
});
