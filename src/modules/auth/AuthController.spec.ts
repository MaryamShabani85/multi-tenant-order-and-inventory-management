import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './AuthController';
import { AuthService } from './services/AuthService';
import { RegisterDto } from './dto/RegisterTenantDto';
import { LoginDto } from './dto/LoginDto';
import { UserRoleEnum } from '../../enum/UserRoleEnum';
import { TenantStatusEnum } from '../../enum/TenantStatusEnum';

describe('AuthController', () =>
{
    let authController: AuthController;
    let authService: jest.Mocked<Partial<AuthService>>;

    beforeEach(async () =>
    {
        // ایجاد شبیه‌ساز (Mock) برای AuthService
        const mockAuthService = {
            register: jest.fn(),
            login: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
            ],
        }).compile();

        authController = module.get<AuthController>(AuthController);
        authService = module.get(AuthService);
    });

    afterEach(() =>
    {
        jest.clearAllMocks(); // پاکسازی وضعیت ماک‌ها بعد از هر تست
    });

    describe('register', () =>
    {
        const mockRegisterDto: RegisterDto = {
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

        it('should call authService.register and return the result', async () =>
        {
            const expectedResult = {
                message: 'Tenant registered successfully',
                tenantId: 'tenant-123',
                userId: 'user-123',
            };

            // مشخص می‌کنیم که متد ماک‌شده چه چیزی باید برگرداند
            (authService.register as jest.Mock).mockResolvedValue(expectedResult);

            const result = await authController.register(mockRegisterDto);

            // ۱. بررسی می‌کنیم متد سرویس با ورودی DTO صدا زده شده باشد
            expect(authService.register).toHaveBeenCalledWith(mockRegisterDto);
            // ۲. بررسی می‌کنیم خروجی کنترلر دقیقاً همان خروجی سرویس باشد
            expect(result).toEqual(expectedResult);
        });
    });

    describe('login', () =>
    {
        const mockLoginDto: LoginDto = {
            email: 'test@example.com',
            password: 'Password123!',
        };

        it('should call authService.login and return accessToken', async () =>
        {
            const expectedResult = {
                accessToken: 'mock-jwt-token',
            };

            (authService.login as jest.Mock).mockResolvedValue(expectedResult);

            const result = await authController.login(mockLoginDto);

            // ۱. بررسی کال شدن متد با دیتای لاگین
            expect(authService.login).toHaveBeenCalledWith(mockLoginDto);
            // ۲. بررسی بازگشت توکن
            expect(result).toEqual(expectedResult);
        });
    });
});